import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎓 KFS Coding Helper
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Korea Foreign School
          </p>
          <p className="text-lg text-gray-500">
            Interactive Python Learning Platform for Cambridge Coding Class
          </p>
        </div>

        {/* Intro Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-indigo-700 mb-4">
            Welcome to Your Coding Journey! 🚀
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            This website is designed to help you master Python programming concepts through fun, 
            interactive visualizations and examples.
          </p>
        </div>

        {/* Lesson Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Loops Card */}
          <Link href="/loops">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-8 hover:scale-105 transition-transform cursor-pointer group">
              <div className="text-white">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="text-2xl font-bold mb-3">Loops</h3>
                <p className="text-green-50 mb-4">
                  Learn how to repeat actions efficiently with for loops and while loops.
                </p>
                <div className="inline-flex items-center text-white font-semibold group-hover:gap-3 gap-2 transition-all">
                  Start Learning
                  <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Nested Loops Card */}
          <Link href="/nested-loops">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-8 hover:scale-105 transition-transform cursor-pointer group">
              <div className="text-white">
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-3">Nested Loops</h3>
                <p className="text-purple-50 mb-4">
                  Master loops inside loops with pizza parties, game grids, and playlists!
                </p>
                <div className="inline-flex items-center text-white font-semibold group-hover:gap-3 gap-2 transition-all">
                  Start Learning
                  <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            💡 <strong>Tip:</strong> Click on any lesson to start your interactive learning experience!
          </p>
        </div>
      </div>
    </div>
  );
}