import Link from "next/link";
import DamascusBackground from "@/components/DamascusBackground";

export default function DamascusPage() {
    return (
        <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-black">

            {/* ── Sidebar (desktop: left 30% / mobile: compact top bar) ── */}
            <aside className="
        relative shrink-0
        flex md:flex-col items-center md:items-start justify-between
        md:w-[30%] md:min-w-[240px] md:h-full
        w-full
        px-6 md:px-10 py-4 md:py-10
        bg-black
        border-b md:border-b-0 md:border-r border-white/5
        z-10
      ">
                {/* Back button */}
                <Link
                    href="/"
                    className="
            inline-flex items-center gap-2
            px-4 py-1.5 rounded-full w-fit
            border border-white/10
            text-white/60 text-sm font-medium
            hover:text-white hover:border-white/30
            transition-all duration-300 group
          "
                >
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                    <span>Back</span>
                </Link>

                {/* Desktop: full title + description */}
                <div className="hidden md:flex flex-col gap-6">
                    <div>
                        <p className="text-[10px] tracking-[0.35em] text-zinc-600 uppercase mb-3 font-mono">
                            WebGL / GLSL
                        </p>
                        <h1 className="text-3xl font-bold text-white leading-snug tracking-tight">
                            Digital Forge:<br />Damascus
                        </h1>
                        <div className="mt-5 h-px w-10 bg-gradient-to-r from-blue-500 to-transparent" />
                    </div>
                    <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
                        <p>
                            ダマスカス鋼とは、中世の刀剣に見られる独特の波紋模様を持つ鋼鉄であり、
                            その製法は長らく謎に包まれていました。このシェーダーはその神秘的な紋様を、
                            GLSLとWebGLで数学的に再現したものです。
                        </p>
                        <p>
                            内部ではドメインワーピング技法を用いた6オクターブのFBM（Fractional Brownian Motion）
                            ノイズを多層合成し、有機的な流動感と金属光沢を表現しています。
                            正弦波によるストライプ生成と、動的な時間変化によって、
                            本物の刃紋が持つ複雑な揺らぎをリアルタイムで描写します。
                        </p>
                        <p className="text-zinc-600 text-xs font-mono">
                            Tech: Three.js · @react-three/fiber · GLSL
                        </p>
                    </div>
                </div>

                {/* Mobile: inline compact title only */}
                <div className="md:hidden">
                    <p className="text-[9px] tracking-[0.3em] text-zinc-600 uppercase font-mono">WebGL / GLSL</p>
                    <h1 className="text-sm font-bold text-white leading-tight">Digital Forge: Damascus</h1>
                </div>

                {/* Bottom year — desktop only */}
                <p className="hidden md:block text-xs text-zinc-700 font-mono">2026</p>
            </aside>

            {/* ── Right panel ── */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0">

                {/* Top black strip: 10% */}
                <div className="h-[10%] shrink-0 bg-black" />

                {/* WebGL area — mobile: mx-[10%] for side margins */}
                <div className="relative mx-[10%] md:mx-0" style={{ flex: "0 0 50%" }}>
                    <DamascusBackground />
                </div>

                {/* Mobile description — below WebGL, black bg */}
                <div className="md:hidden flex-1 px-[10%] py-5 bg-black overflow-y-auto">
                    <p className="text-white/90 text-sm font-semibold mb-2">Liquid Steel Simulation</p>
                    <div className="space-y-2 text-zinc-400 text-xs leading-relaxed">
                        <p>
                            ダマスカス鋼とは、中世の刀剣に見られる独特の波紋模様を持つ鋼鉄。
                            そのシェーダーをGLSL・WebGLで数学的に再現しています。
                        </p>
                        <p>
                            ドメインワーピング技法による6オクターブのFBMノイズを多層合成し、
                            有機的な流動感と金属光沢をリアルタイムで描写します。
                        </p>
                        <p className="text-zinc-600 font-mono text-[10px] pt-1">
                            Three.js · @react-three/fiber · GLSL
                        </p>
                    </div>
                </div>

                {/* Bottom black strip: 10% — desktop only */}
                <div className="hidden md:block h-[10%] shrink-0 bg-black" />

            </div>
        </div>
    );
}
