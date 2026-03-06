// Imports React state hook for managing component state.
import { useState } from "react";

// Imports the shared layout component used for this page.
import AuthLayout from "./AuthLayout";

// Imports navigation hook from React Router.
import { useNavigate } from "react-router-dom";

// Imports the API helper used to make backend requests.
import { api } from "../api/api";

// Main landing page component.
export default function Landing() {
  // Used to move the user to another page.
  const navigate = useNavigate();

  // Tracks whether the app is checking the user's login session.
  const [checking, setChecking] = useState(false);

  // Runs when the user clicks the Play button.
  // It checks if the user is already logged in.
  async function handlePlay() {
    setChecking(true);
    try {
      // Sends a request to check whether the current session is valid.
      await api.get("/users/me");

      // If the user is already logged in, go to the main menu.
      navigate("/mainmenu");
    } catch {
      // If the session is not valid, send the user to the login page.
      navigate("/login");
    } finally {
      // Stops the loading state after the check finishes.
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
          {/* Decorative gradient layer inside the card */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

          {/* Soft border highlight around the card */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative flex flex-col items-center px-10">
            {/* Main title shown on the landing page */}
            <h1 className="text-center text-8xl leading-none font-bold tracking-tight">
              HeartBounce
            </h1>

            {/* Main action button that checks login status before starting */}
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
              {/* Inner overlay for glossy button styling */}
              <span className="absolute inset-2 rounded-xl bg-white/10" />

              {/* Button text changes while session check is in progress */}
              <span className="relative text-xl font-extrabold tracking-wide text-[#070a18]">
                {checking ? "Checking..." : "PLAY"}
              </span>
            </button>

            {/* Small feature labels shown below the Play button */}
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

// Reusable pill-shaped label component.
// It shows short feature text with different color styles.
function Pill({ text, tone }) {
  // Chooses the style based on the tone prop.
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
      {/* Displays the text inside the pill */}
      {text}
    </div>
  );
}