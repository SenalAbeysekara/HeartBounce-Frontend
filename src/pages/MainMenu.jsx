import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import {
  FaChevronDown,
  FaPlay,
  FaChartLine,
  FaTrophy,
  FaUser,
  FaArrowRight,
} from "react-icons/fa";
import { api } from "../api/api";

export default function MainMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await api.get("/users/me");
        setUser(res.data.user);
      } catch {
        navigate("/login");
      }
    }

    loadMe();
  }, [navigate]);

  async function handleLogout() {
    try {
      await api.post("/users/logout", {});
    } finally {
      navigate("/login");
    }
  }

  if (!user) {
    return (
      <AuthLayout>
        <div className="text-white/70">Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-6 z-20">
        <div className="relative flex items-center gap-5 rounded-2xl border border-white/10 bg-white/10 px-6 py-1 backdrop-blur-xl">
          <img
            src={user.image || "/images/default.jpg"}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover"
          />

          <span className="text-sm font-semibold text-white">
            {user.userName || "Player"}
          </span>

          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="ml-1 rounded-xl p-2 transition hover:bg-white/10"
            aria-label="Open user menu"
          >
            <FaChevronDown className="text-white" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0b1027]/95 shadow-2xl">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthLayout>
        <div className="w-full max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

            <div className="relative">
              <h1 className="text-center text-4xl font-extrabold tracking-tight text-white">
                Main Menu
              </h1>

              <p className="mt-2 text-center text-sm text-white/60">
                Choose your next move
              </p>

              <div className="mt-10 space-y-4">
                <MenuButton
                  text="Start Game"
                  description="Begin Your Bounce Journey"
                  to="/game"
                  icon={<FaPlay />}
                />
                <MenuButton
                  text="Progress Log"
                  description="Track Every Bounce"
                  to="/progress-log"
                  icon={<FaChartLine />}
                />
                <MenuButton
                  text="Leaderboard"
                  description="Bounce Your Way To The Top"
                  to="/leaderboard"
                  icon={<FaTrophy />}
                />
                <MenuButton
                  text="Player Profile"
                  description="See Your Evolution"
                  to="/player-profile"
                  icon={<FaUser />}
                />
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}

function MenuButton({ text, description, to, icon }) {
  return (
    <Link
      to={to}
      className="
        group block rounded-2xl border border-white/10 bg-[#0b1027]/60
        px-6 py-5 shadow-xl transition duration-200
        hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#0b1027]/85
        hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-3 text-cyan-300 transition group-hover:bg-cyan-400/10 group-hover:text-cyan-200">
            {icon}
          </div>

          <div>
            <div className="text-lg font-semibold text-white">{text}</div>
            <div className="mt-1 text-sm text-white/60">{description}</div>
          </div>
        </div>

        <FaArrowRight className="shrink-0 text-white/35 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
      </div>
    </Link>
  );
}