import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { FaPlay, FaStar, FaTrophy, FaGamepad } from "react-icons/fa";
import { MdSpeed } from "react-icons/md";

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  async function handlePlay() {
    setChecking(true);

    try {
      await api.get("/users/me");
      navigate("/mainmenu");
    } catch {
      navigate("/login");
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl px-4">
        <div
          className="
            relative overflow-hidden rounded-3xl
            border border-white/10
            bg-white/10
            backdrop-blur-2xl
            shadow-2xl
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/15 via-indigo-500/10 to-cyan-500/15" />
          <div className="pointer-events-none absolute -top-16 -left-10 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="pointer-events-none absolute top-20 right-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative grid gap-12 px-8 py-12 md:px-14 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left side */}
            <div className="text-center lg:pl-4 lg:text-left">
              <h1 className="max-w-[520px] text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                HeartBounce
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                Bounce, collect stars, avoid obstacles, and survive as long as
                you can.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 lg:justify-start">
                  <MdSpeed className="text-cyan-300" />
                  3 Difficulty Levels
                </div>

                <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 lg:justify-start">
                  <FaStar className="text-yellow-300" />
                  Score Tracking
                </div>

                <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 lg:justify-start">
                  <FaTrophy className="text-amber-300" />
                  Leaderboard Competition
                </div>
              </div>

              <div className="mt-10 flex justify-center lg:justify-start">
                <button
                  onClick={handlePlay}
                  disabled={checking}
                  className="
                    flex w-full max-w-[440px] items-center justify-center gap-3
                    rounded-2xl py-4
                    bg-linear-to-r from-fuchsia-500 via-indigo-500 to-cyan-400
                    text-lg font-extrabold tracking-wide text-[#070a18]
                    shadow-xl transition
                    hover:scale-[1.02] hover:brightness-110
                    active:scale-95
                    disabled:opacity-60
                  "
                >
                  <FaPlay />
                  {checking ? "Checking..." : "Play Now"}
                </button>
              </div>
            </div>

            {/* Right side */}
            <div className="relative">
              <div
                className="
                  relative mx-auto max-w-md rounded-3xl
                  border border-white/10
                  bg-slate-950/40
                  p-6 shadow-2xl
                "
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Game Preview
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      Enter the Arena
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-3 text-cyan-300">
                    <FaGamepad size={22} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-pink-400/20 bg-white/5 p-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-3xl shadow-inner">
                      ⚽
                    </div>
                    <p className="mt-3 font-semibold text-white">Ball</p>
                    <p className="mt-1 text-sm text-white/60">
                      Control your bounce
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/20 bg-white/5 p-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/20 text-3xl shadow-inner">
                      ⭐
                    </div>
                    <p className="mt-3 font-semibold text-white">Star</p>
                    <p className="mt-1 text-sm text-white/60">
                      Collect for points
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20 text-3xl shadow-inner">
                      🪨
                    </div>
                    <p className="mt-3 font-semibold text-white">Obstacle</p>
                    <p className="mt-1 text-sm text-white/60">
                      Avoid to survive
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-fuchsia-500/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-cyan-500/20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}