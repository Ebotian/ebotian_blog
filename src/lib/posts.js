import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

// 递归获取 posts 目录下所有 md 文件路径
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 获取所有文章的元数据（title, date, slug, excerpt 等）
export function getAllPostsMeta() {
  const files = getAllMarkdownFiles(postsDirectory);
  const posts = files.map((filePath) => {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    // 生成 slug（相对 posts 目录的路径，去掉 .md 后缀，斜杠用 __ 代替）
    const relPath = path.relative(postsDirectory, filePath);
    const slug = relPath.replace(/\\/g, "/").replace(/\//g, "__").replace(/\.md$/, "");
    // 处理 date 字段为字符串
    let dateStr = null;
    if (data.date) {
      if (typeof data.date === "string") {
        dateStr = data.date;
      } else if (data.date instanceof Date) {
        dateStr = data.date.toISOString();
      } else {
        dateStr = String(data.date);
      }
    }
    // 只展开除 date 以外的 frontmatter 字段，避免 date 被覆盖为 Date 对象
    const { date, ...restData } = data;
    return {
      title: data.title || slug,
      date: dateStr,
      excerpt: data.excerpt || content.slice(0, 50),
      slug,
      ...restData,
    };
  });
  // 按日期降序排列
  posts.sort((a, b) => (b.date || "") > (a.date || "") ? 1 : -1);
  return posts;
}

// 根据 slug 获取单篇文章内容和元数据
export function getPostBySlug(slug) {
  // slug 还原为相对路径
  const relPath = slug.replace(/__/g, path.sep) + ".md";
  const fullPath = path.join(postsDirectory, relPath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  // 处理 date 字段为字符串
  let dateStr = null;
  if (data.date) {
    if (typeof data.date === "string") {
      dateStr = data.date;
    } else if (data.date instanceof Date) {
      dateStr = data.date.toISOString();
    } else {
      dateStr = String(data.date);
    }
  }
  const { date, ...restData } = data;
  return {
    slug,
    content,
    date: dateStr,
    ...restData,
  };
}
