import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { api } from "../api/api";

const MODES = [
  {
    key: "easy",
    title: "Easy",
    speedMult: 0.8,
    bg: "/sprites/bg1.jpg",
    obstacle: "/sprites/obstacle1.png",
    motto: "Warm up your bounce.",
    badge: "Beginner Friendly",
    speedLabel: "Slow Pace",
    description: "Best for beginners who want a relaxed start.",
    accent:
      "from-emerald-400/30 via-green-400/20 to-teal-400/30 border-emerald-300/30",
    badgeStyle: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30",
    speedStyle: "bg-emerald-500/15 text-emerald-100 border-emerald-300/20",
  },
  {
    key: "medium",
    title: "Medium",
    speedMult: 1.1,
    bg: "/sprites/bg2.jpg",
    obstacle: "/sprites/obstacle2.png",
    motto: "Find your rhythm with balanced.",
    badge: "Balanced Mode",
    speedLabel: "Medium Pace",
    description: "Balanced speed and timing for steady challenge.",
    accent:
      "from-amber-400/30 via-orange-400/20 to-yellow-400/30 border-amber-300/30",
    badgeStyle: "bg-amber-400/15 text-amber-200 border-amber-300/30",
    speedStyle: "bg-orange-500/15 text-orange-100 border-orange-300/20",
  },
  {
    key: "hard",
    title: "Hard",
    speedMult: 1.3,
    bg: "/sprites/bg3.jpg",
    obstacle: "/sprites/obstacle3.png",
    motto: "Only the sharp survive.",
    badge: "Expert Challenge",
    speedLabel: "Fast Pace",
    description: "Fast reaction required with less room for mistakes.",
    accent:
      "from-pink-400/30 via-rose-400/20 to-red-400/30 border-pink-300/30",
    badgeStyle: "bg-pink-400/15 text-pink-200 border-pink-300/30",
    speedStyle: "bg-rose-500/15 text-rose-100 border-rose-300/20",
  },
];

export default function GameModeSelect() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      try {
        await api.get("/users/me");
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        navigate("/login");
      }
    }

    checkLogin();
  }, [navigate]);

  if (isLoggedIn === null) {
    return (
      <AuthLayout>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white/70 backdrop-blur-xl">
          Loading...
        </div>
      </AuthLayout>
    );
  }

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
      <div className="w-full max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white">
                  Choose Difficulty
                </h1>
                <p className="mt-2 text-white/60">
                  Pick your challenge and test your bouncing skills.
                </p>
              </div>

              <Link
                to="/mainmenu"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ← Back
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => pick(m)}
                  className={`group relative overflow-hidden rounded-3xl border shadow-2xl transition duration-200 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] ${m.accent}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${m.bg})` }}
                  />

                  <div className="absolute inset-0 bg-black/60 transition group-hover:bg-black/50" />

                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.accent} opacity-80`}
                  />

                  <div className="relative flex h-full flex-col p-6 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${m.badgeStyle}`}
                        >
                          {m.badge}
                        </div>

                        <div className="mt-4 text-2xl font-extrabold text-white">
                          {m.title}
                        </div>

                        <div className="mt-2 text-sm text-white/75">
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

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${m.speedStyle}`}
                      >
                        {m.speedLabel}
                      </span>

                      <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                        x{m.speedMult} Speed
                      </span>
                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-white/80">
                      {m.description}
                    </p>

                    <div className="mt-6 inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur-md transition group-hover:bg-white/15">
                      Click to Play →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}