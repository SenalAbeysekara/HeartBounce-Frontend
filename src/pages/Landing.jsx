import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  async function handlePlay() {
    setChecking(true);
    try {
      // check if cookie/session valid
      await api.get("/auth/me");
      navigate("/mainmenu"); // already logged in
    } catch {
      navigate("/login"); // not logged in
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl">
        <div
          className="
            relative rounded-3xl
            border border-white/10
            bg-white/10
            backdrop-blur-2xl
            shadow-2xl
            overflow-hidden
            py-16
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative flex flex-col items-center px-10">
            <h1 className="text-center text-8xl leading-none font-bold tracking-tight">
              HeartBounce
            </h1>

            {/* PLAY button */}
            <button
              onClick={handlePlay}
              disabled={checking}
              className="
                mt-14 relative
                h-20 w-80
                rounded-2xl
                bg-linear-to-r from-fuchsia-500 via-indigo-500 to-cyan-400
                shadow-xl
                hover:brightness-110 active:scale-95 transition
                disabled:opacity-60
              "
            >
              <span className="absolute inset-2 rounded-xl bg-white/10" />

              <span className="relative text-xl font-extrabold tracking-wide text-[#070a18]">
                {checking ? "Checking..." : "PLAY"}
              </span>
            </button>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              <Pill tone="cyan" text="Race The Timer" />
              <Pill tone="purple" text="Solve Challenges" />
              <Pill tone="purple" text="Climb Leaderboard" />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function Pill({ text, tone }) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-300/25 text-cyan-100 shadow-lg"
      : "border-fuchsia-300/20 text-fuchsia-100 shadow-lg";

  return (
    <div
      className={`
        h-12 w-44
        flex items-center justify-center
        rounded-full border
        bg-[#0b1027]/40
        backdrop-blur-xl
        text-sm tracking-wide
        hover:bg-white/10 transition
        ${toneClass}
      `}
    >
      {text}
    </div>
  );
}