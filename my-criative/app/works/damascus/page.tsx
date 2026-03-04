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
                            Liquid Steel:<br />Digital Forging of Damascus Steel
                        </h1>
                        <div className="mt-5 h-px w-10 bg-gradient-to-r from-blue-500 to-transparent" />
                    </div>
                    <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
                        <p>
                            ダマスカス鋼——中世の刀剣に見られるその神秘的な波紋模様の真の製法は、現代においても完全には解明されておらず、
                            歴史の謎に包まれています。本作品は、失われた「奇跡の鍛造技術」を、WebGLとGLSLの数学的アプローチによってブラウザ上で錬成（再現）したものです。
                        </p>
                        <p>
                            金属工学的な生成メカニズムそのもののシミュレーションに挑んでいます。
                            結晶成長と析出： 溶けた鋼からデンドライト（樹枝状結晶）が成長する過程を、鋭いリッジを持つ7オクターブの absolute-noise fBm で形成。
                            その隙間に析出するセメンタイト（$Fe_3C$）の粒子を Worley ノイズの閾値処理で配置しています。
                            鍛造プロセスの模倣： 鍛冶屋が金属を幾度も叩き延ばす工程を、Y軸への強力なストレッチと2段階の蛇行ドメインワーピング（空間の歪曲）で表現し、微小な結晶を地層のような帯状の模様へと変換しました。
                            エッチングと金属光沢： 最終工程である酸による腐食（エッチング）を、硬質帯（シルバー）と軟質谷（漆黒）の鮮烈なコントラストで可視化。有限差分による法線推定と Blinn-Phong 反射モデルを組み込みました。
                            時間の経過とともに、結晶の成長、鍛造による流動、そして回転する光源からの鈍い反射が滑らかに連動します。
                            まるで生きているかのように呼吸する「デジタルのダマスカス鋼」
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
