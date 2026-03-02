import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Hero Header */}
      <header className="px-8 pt-20 pb-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.3em] text-zinc-500 uppercase mb-4">
          Personal Laboratory
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-5">
          Web Experiments Lab
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
          個人的な技術検証やWebGLの実験置き場です。
        </p>
        <div className="mt-8 h-px w-16 bg-gradient-to-r from-blue-500 to-transparent" />
      </header>

      {/* Gallery Grid */}
      <main className="px-8 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1 — Liquid Steel */}
          <Link href="/works/damascus" className="group block focus:outline-none">
            <article className="
              relative overflow-hidden rounded-2xl
              bg-gradient-to-br from-zinc-900 to-zinc-800
              border border-white/5
              transition-all duration-500
              group-hover:-translate-y-2
              group-hover:shadow-[0_0_40px_rgba(96,165,250,0.25)]
              group-hover:border-blue-400/40
              cursor-pointer
            ">
              {/* Thumbnail / preview area */}
              <div className="relative h-52 overflow-hidden">
                {/* Animated shimmer preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a3a6e] to-[#0d1a35]" />
                <div className="
                  absolute inset-0
                  bg-[radial-gradient(ellipse_at_30%_60%,rgba(96,165,250,0.25)_0%,transparent_70%)]
                  animate-pulse
                " />
                {/* Faux stripe lines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20"
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                >
                  {[...Array(12)].map((_, i) => (
                    <path
                      key={i}
                      d={`M${-20 + i * 22},0 Q${30 + i * 22},100 ${i * 22},200`}
                      stroke="rgba(150,200,255,0.6)"
                      strokeWidth="1"
                      fill="none"
                    />
                  ))}
                </svg>
                {/* WebGL badge */}
                <span className="
                  absolute top-3 right-3
                  bg-blue-500/20 border border-blue-400/30
                  text-blue-300 text-[10px] font-mono tracking-widest
                  px-2 py-0.5 rounded-full backdrop-blur-sm
                ">
                  WebGL
                </span>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h2 className="text-white font-semibold text-lg leading-snug mb-1 group-hover:text-blue-300 transition-colors duration-300">
                  Liquid Steel
                </h2>
                <p className="text-zinc-400 text-sm">
                  WebGL Damascus Pattern
                </p>
                {/* Arrow */}
                <div className="mt-4 flex items-center gap-1 text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>View experiment</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>

              {/* Glow border overlay */}
              <div className="
                absolute inset-0 rounded-2xl pointer-events-none
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                ring-1 ring-blue-400/40
              " />
            </article>
          </Link>

          {/* Card 2 — Traffic Light (Coming Soon) */}
          <article className="
            relative overflow-hidden rounded-2xl
            bg-gradient-to-br from-zinc-900 to-zinc-800
            border border-white/5
            opacity-60
            cursor-not-allowed
          ">
            {/* Thumbnail */}
            <div className="relative h-52 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
              {/* Traffic light silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col gap-3 items-center">
                  {["bg-red-500/30", "bg-yellow-400/30", "bg-green-500/30"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border border-white/10`} />
                  ))}
                </div>
              </div>
              {/* Coming Soon badge */}
              <span className="
                absolute top-3 right-3
                bg-zinc-700/60 border border-white/10
                text-zinc-400 text-[10px] font-mono tracking-widest
                px-2 py-0.5 rounded-full backdrop-blur-sm
              ">
                Soon
              </span>
            </div>
            {/* Card body */}
            <div className="p-5">
              <h2 className="text-zinc-400 font-semibold text-lg leading-snug mb-1">
                Traffic Light Animation
              </h2>
              <p className="text-zinc-600 text-sm">Coming Soon</p>
            </div>
          </article>

        </div>
      </main>
    </div>
  );
}
