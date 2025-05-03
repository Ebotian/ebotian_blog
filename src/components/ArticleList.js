import Card from "./Card";
import Link from "next/link";

export default function ArticleList({ posts }) {
	if (!posts || posts.length === 0) {
		return <div className="text-center text-gray-400 mt-8">暂无文章</div>;
	}
	return (
		<div className="flex flex-col gap-6">
			{posts.map((post) => (
				<Link key={post.slug} href={`/${post.slug}`} passHref legacyBehavior>
					<a>
						<Card>
							<div className="flex flex-col md:flex-row md:items-center justify-between">
								<div>
									<h2 className="text-xl font-bold mb-1 dos-title">
										{post.title}
									</h2>
									<p className="text-sm text-green-300 mb-2">{post.date}</p>
									<p className="text-base text-green-200 line-clamp-2">
										{post.excerpt}
									</p>
								</div>
							</div>
						</Card>
					</a>
				</Link>
			))}
		</div>
	);
}
