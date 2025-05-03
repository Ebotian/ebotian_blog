import React from "react";
import Card from "./Card";

export default function ArticleContent({ title, date, contentHtml }) {
  return (
    <Card hoverEffect={false}>
      <article>
        <h1 className="text-2xl font-bold mb-2 dos-title">{title}</h1>
        <p className="text-sm text-green-300 mb-4">{date}</p>
        <div
          className="prose prose-invert max-w-none text-green-100 dos-article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </Card>
  );
}
