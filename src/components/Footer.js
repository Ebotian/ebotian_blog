export default function Footer() {
  return (
    <div className="text-center text-xs text-green-400 py-4 border-t border-green-700 bg-black bg-opacity-80 dos-footer">
      <p>
        版权所有 © {new Date().getFullYear()} Ebit &nbsp;|&nbsp; 内容仅供学习与交流 &nbsp;|&nbsp; Powered by Next.js & TailwindCSS
      </p>
    </div>
  );
}