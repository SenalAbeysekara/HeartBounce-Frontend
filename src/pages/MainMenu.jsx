import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { FaChevronDown } from "react-icons/fa";
import { api } from "../api/api";

export default function MainMenu() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // user from /api/auth/me
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check auth when page loads
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await api.get("/users/me");
        setUser(res.data.user);
      } catch (err) {
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

  // Loading while verifying cookie
  if (!user) {
    return (
      <AuthLayout>
        <div className="text-white/70">Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <div className="relative">
      {/* Top-right profile (outside main card) */}
      <div className="absolute top-4 right-6 z-20">
        <div className="relative flex items-center gap-5 rounded-2xl border border-white/10 bg-white/10 px-6 py-1 backdrop-blur-xl">
          <img
            src={user.image || "/images/default.jpg"}
            alt="Profile"
            className="h-12 w-9 rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-white">
            {user.userName || "Player"}
          </span>

          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="ml-1 rounded-xl p-2 hover:bg-white/10 transition"
            aria-label="Open user menu"
          >
            <FaChevronDown className="text-white" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0b1027]/95 shadow-2xl">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition"
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
              <h1 className="text-center text-4xl font-extrabold tracking-tight">
                Main Menu
              </h1>
              <p className="mt-2 text-center text-sm text-white/60">
                Choose your next move
              </p>

              <div className="space-y-4 mt-10">
                <MenuButton
                  text="Start Game"
                  description="Begin Your Bounce Journey"
                  to="/game"
                />
                <MenuButton
                  text="Progress Log"
                  description="Track Every Bounce"
                  to="/progress-log"
                />
                <MenuButton
                  text="Leaderboard"
                  description="Bounce Your Way To The Top"
                  to="/leaderboard"
                />
                <MenuButton
                  text="Player Profile"
                  description="See Your Evolution"
                  to="/player-profile"
                />
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}

function MenuButton({ text, description, to }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-white/10 bg-[#0b1027]/60 px-6 py-5 shadow-xl hover:bg-[#0b1027]/80 transition"
    >
      <div className="text-lg font-semibold text-white">{text}</div>
      <div className="mt-1 text-sm text-white/60">{description}</div>
    </Link>
  );
}
