import { getAllPostsMeta } from "../lib/posts";
import RSS from "rss";

export async function getServerSideProps({ res }) {
  const siteUrl = "https://ebotian-blog.vercel.app"; // 替换为你的实际域名
  const posts = getAllPostsMeta();

  const feed = new RSS({
    title: "Ebit's Blog",
    description: "Ebit 的个人博客 RSS 订阅",
    feed_url: `${siteUrl}/rss.xml`,
    site_url: siteUrl,
    language: "zh-CN",
    pubDate: new Date().toUTCString(),
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/${post.slug}`,
      date: post.date,
    });
  });

  res.setHeader("Content-Type", "application/xml");
  res.write(feed.xml({ indent: true }));
  res.end();

  return { props: {} };
}

export default function RSSFeed() {
  // 该页面不会被实际渲染
  return null;
}
