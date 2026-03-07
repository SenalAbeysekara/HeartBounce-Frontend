import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";

// Available difficulty modes
const MODES = [
  {
    key: "easy",
    title: "Easy",
    speedMult: 0.8,
    bg: "/sprites/bg1.jpg",
    obstacle: "/sprites/obstacle1.png",
    motto: "Warm up your bounce.",
  },
  {
    key: "medium",
    title: "Medium",
    speedMult: 1.1,
    bg: "/sprites/bg2.jpg",
    obstacle: "/sprites/obstacle2.png",
    motto: "Find your rhythm.",
  },
  {
    key: "hard",
    title: "Hard",
    speedMult: 1.3,
    bg: "/sprites/bg3.jpg",
    obstacle: "/sprites/obstacle3.png",
    motto: "Only the sharp survive.",
  },
];

export default function GameModeSelect() {
  const navigate = useNavigate();

  const pick = (m) => {
    navigate("/heart-bounce", {
      state: {
        difficulty: m.key,
        speedMult: m.speedMult,
        bg: m.bg,
        obstacle: m.obstacle,
      },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Choose Difficulty
              </h1>
              <p className="mt-2 text-white/60">Difficulty changes your speed.</p>
            </div>

            <Link to="/mainmenu" className="text-white/70 hover:text-white">
              ← Back
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => pick(m)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${m.bg})` }}
                />

                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition" />

                <div className="relative p-6 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl font-extrabold text-white">
                        {m.title}
                      </div>
                      <div className="mt-2 text-xs text-white/70">
                        {m.motto}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                      <img
                        src={m.obstacle}
                        alt="obstacle"
                        className="h-14 w-14 object-contain drop-shadow"
                      />
                    </div>
                  </div>

                  <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Click to Play →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}