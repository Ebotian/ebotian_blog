import Home, { getStaticProps } from "./index";

export default function CocoPage(props) {
	// 强制展示全部 posts
	return <Home {...props} showAllOverride={true} />;
}

export { getStaticProps };
