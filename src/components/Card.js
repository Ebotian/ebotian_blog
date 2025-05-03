export default function Card({ children }) {
	return (
		<div className="bg-gray-900 border-2 border-green-400 rounded-lg shadow-lg p-6 transition-transform hover:scale-105 hover:shadow-2xl dos-card">
			{children}
		</div>
	);
}
