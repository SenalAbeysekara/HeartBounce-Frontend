// Imports React hooks for state management and side effects.
import { useEffect, useState } from "react";

// Imports routing tools for navigation and page links.
import { Link, useNavigate } from "react-router-dom";

// Imports the shared layout used across pages.
import AuthLayout from "./AuthLayout";

// Imports the dropdown icon used in the profile menu.
import { FaChevronDown } from "react-icons/fa";

// Imports the API helper for backend requests.
import { api } from "../api/api";

// This component shows the main menu page after the user logs in.
export default function MainMenu() {
  // Used to move the user to another page when needed.
  const navigate = useNavigate();

  // Stores the logged-in user's data.
  const [user, setUser] = useState(null);

  // Controls whether the profile dropdown menu is open or closed.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Runs when the page loads to check whether the user is logged in.
  useEffect(() => {
    async function loadMe() {
      try {
        // Requests the current logged-in user's details from the backend.
        const res = await api.get("/users/me");

        // Saves the user data into state.
        setUser(res.data.user);
      } catch (err) {
        // If the user is not logged in, send them to the login page.
        navigate("/login");
      }
    }

    loadMe();
  }, [navigate]);

  // Logs the user out and returns them to the login page.
  async function handleLogout() {
    try {
      // Sends logout request to the backend.
      await api.post("/users/logout", {});
    } finally {
      // Redirects to login whether logout succeeds or not.
      navigate("/login");
    }
  }

  // Shows a loading message while checking the user's session.
  if (!user) {
    return (
      <AuthLayout>
        <div className="text-white/70">Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <div className="relative">
      {/* Profile section placed at the top-right corner of the page */}
      <div className="absolute top-4 right-6 z-20">
        <div className="relative flex items-center gap-5 rounded-2xl border border-white/10 bg-white/10 px-6 py-1 backdrop-blur-xl">
          {/* Displays the user's profile image or a default image if none exists */}
          <img
            src={user.image || "/images/default.jpg"}
            alt="Profile"
            className="h-12 w-9 rounded-full object-cover"
          />

          {/* Displays the user's name or a default label */}
          <span className="text-sm font-semibold text-white">
            {user.userName || "Player"}
          </span>

          {/* Button to open or close the dropdown menu */}
          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="ml-1 rounded-xl p-2 hover:bg-white/10 transition"
            aria-label="Open user menu"
          >
            <FaChevronDown className="text-white" />
          </button>

          {/* Dropdown menu shown when the toggle button is clicked */}
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
            {/* Decorative gradient background inside the main card */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

            {/* Soft border glow effect around the card */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

            <div className="relative">
              {/* Main page title */}
              <h1 className="text-center text-4xl font-extrabold tracking-tight">
                Main Menu
              </h1>

              {/* Small subtitle below the title */}
              <p className="mt-2 text-center text-sm text-white/60">
                Choose your next move
              </p>

              {/* List of menu options */}
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

// Reusable menu button component used for each main menu option.
function MenuButton({ text, description, to }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-white/10 bg-[#0b1027]/60 px-6 py-5 shadow-xl hover:bg-[#0b1027]/80 transition"
    >
      {/* Main button text */}
      <div className="text-lg font-semibold text-white">{text}</div>

      {/* Small description shown under the main text */}
      <div className="mt-1 text-sm text-white/60">{description}</div>
    </Link>
  );
}