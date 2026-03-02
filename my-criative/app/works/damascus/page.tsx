import Link from "next/link";
import DamascusBackground from "@/compnents/DamascusBackground";

export default function DamascusPage() {
    return (
        <div className="flex w-screen h-screen overflow-hidden bg-black">

            {/* ── Left panel: ~30% — black bg, title & back button ── */}
            <aside className="relative flex flex-col justify-between w-[30%] min-w-[220px] h-full px-8 py-10 bg-black shrink-0">
                {/* Back button */}
                <Link
                    href="/"
                    className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-full w-fit
            border border-white/10
            text-white/60 text-sm font-medium
            hover:text-white hover:border-white/30
            transition-all duration-300 group
          "
                >
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                    <span>Back</span>
                </Link>

                {/* Title block */}
                <div>
                    <p className="text-[10px] tracking-[0.35em] text-zinc-600 uppercase mb-3 font-mono">
                        WebGL / GLSL
                    </p>
                    <h1 className="text-3xl font-bold text-white leading-snug tracking-tight">
                        Digital Forge:<br />Damascus
                    </h1>
                    <div className="mt-5 h-px w-10 bg-gradient-to-r from-blue-500 to-transparent" />
                </div>

                {/* Bottom decoration */}
                <p className="text-xs text-zinc-700 font-mono">2026</p>
            </aside>

            {/* ── Right panel: ~70% — WebGL + description overlay ── */}
            <div className="relative flex-1 h-full">
                {/* WebGL canvas */}
                <DamascusBackground />

                {/* Description — bottom-left of the WebGL area */}
                <div className="
          absolute bottom-8 left-8 z-10
          max-w-xs
          bg-black/50 backdrop-blur-md
          border border-white/10
          rounded-xl px-5 py-4
        ">
                    <p className="text-white/90 text-sm font-semibold mb-1">
                        Liquid Steel Simulation
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                        ドメインワープFBM（Fractional Brownian Motion）とGLSLシェーダーで
                        生成したダマスカス鋼の紋様。ノイズの多層合成により、
                        刃紋に宿る有機的な流動感をリアルタイムで再現しています。
                    </p>
                </div>
            </div>

        </div>
    );
}
