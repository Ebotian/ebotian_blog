export default function Profile() {
  return (
    <div className="flex flex-col items-center bg-gray-800 bg-opacity-90 border-2 border-blue-400 rounded-xl p-4 shadow-xl w-56 dos-card-profile">
      <img
        src="/avatar.jpg"
        alt="avatar"
        className="w-28 h-28 rounded-full border-4 border-blue-300 mb-2 shadow-md"
        draggable="false"
      />
      <h2 className="text-lg font-bold text-blue-200 mt-2 mb-1">Ebit</h2>
      <p className="text-sm text-blue-100 mb-2 text-center">热爱编程与电子<br/>欢迎交流！</p>
      <div className="flex space-x-3 mt-2">
        <a href="yiboxiaotian@nuaa.edu.cn" title="邮箱" target="_blank" rel="noopener noreferrer">
          <img src="/globe.svg" alt="email" className="w-6 h-6" />
        </a>
        <a href="https://github.com/Ebotian" title="GitHub" target="_blank" rel="noopener noreferrer">
          <img src="/file.svg" alt="github" className="w-6 h-6" />
        </a>
        <a href="https://x.com/asilena123" title="X(Twitter)" target="_blank" rel="noopener noreferrer">
          <img src="/window.svg" alt="x" className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
