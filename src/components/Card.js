export default function Card({ children, hoverEffect = true }) {
	return (
		<div
			className={`border-2 border-green-400 rounded-lg p-6 ${
				hoverEffect ? "transition-transform hover:scale-105" : ""
			} dos-card`}
			style={{ color: "var(--card-text)", boxShadow: "none" }}
		>
			{children}
		</div>
	);
}
