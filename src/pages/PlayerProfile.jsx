// Imports React hooks for component state, side effects, and memoized calculations.
import { useEffect, useMemo, useState } from "react";

// Imports the shared page layout component.
import AuthLayout from "./AuthLayout";

// Imports routing tools for page links and navigation.
import { Link, useNavigate } from "react-router-dom";

// Imports the API helper used to communicate with the backend.
import { api } from "../api/api";

// This component shows the player's profile page.
export default function PlayerProfile() {
  // Used to move the user to another page when needed.
  const navigate = useNavigate();

  // Stores the logged-in user's details.
  const [user, setUser] = useState(null);

  // Stores all game runs made by the current user.
  const [runs, setRuns] = useState([]);

  // Stores difficulty-based stats returned from the backend.
  const [diffStats, setDiffStats] = useState(null);

  // Controls whether the username edit form is visible.
  const [editing, setEditing] = useState(false);

  // Stores the new username typed by the user.
  const [newName, setNewName] = useState("");

  // Tracks whether the username update request is in progress.
  const [saving, setSaving] = useState(false);

  // Stores a success message to show on screen.
  const [msg, setMsg] = useState("");

  // Stores an error message to show on screen.
  const [err, setErr] = useState("");

  // Loads user profile data, run history, and stats when the page opens.
  useEffect(() => {
    (async () => {
      try {
        // Gets the logged-in user's information.
        const meRes = await api.get("/users/me");
        setUser(meRes.data.user);

        // Pre-fills the username input with the current username.
        setNewName(meRes.data.user.userName || "");

        // Gets all runs made by the current user.
        const runsRes = await api.get("/game/runs/me");
        const myRuns = runsRes.data.runs || [];
        setRuns(myRuns);

        // Tries to get difficulty-based stats directly from the backend.
        try {
          const statsRes = await api.get("/game/profile-stats");
          setDiffStats(statsRes.data.stats);
        } catch {
          // If backend stats fail, fallback stats will be calculated from runs.
          setDiffStats(null);
        }
      } catch {
        // If the user is not logged in, send them to the login page.
        navigate("/login");
      }
    })();
  }, [navigate]);

  // Total number of runs played by the user.
  const totalRuns = runs.length;

  // Calculates stats from the user's runs.
  // This acts as a fallback when backend stats are missing or incorrect.
  const computedStats = useMemo(() => {
    const base = {
      easy: { runs: 0, bestScore: 0 },
      medium: { runs: 0, bestScore: 0 },
      hard: { runs: 0, bestScore: 0 },
    };

    for (const r of runs) {
      if (!base[r.difficulty]) continue;
      base[r.difficulty].runs += 1;

      if (r.score > base[r.difficulty].bestScore) {
        base[r.difficulty].bestScore = r.score;
      }
    }

    return base;
  }, [runs]);

  // Chooses which stats to display.
  // It uses backend stats if they look valid, otherwise it uses computed stats.
  const finalStats = useMemo(() => {
    const s = diffStats || computedStats;

    // If backend stats show zero runs even though runs exist,
    // use the locally computed stats instead.
    const sumRuns =
      (s?.easy?.runs || 0) +
      (s?.medium?.runs || 0) +
      (s?.hard?.runs || 0);

    if (totalRuns > 0 && sumRuns === 0) return computedStats;

    return s;
  }, [diffStats, computedStats, totalRuns]);

  // Calculates the total score from all runs.
  const totalScore = useMemo(() => {
    return runs.reduce((sum, r) => sum + (r.score || 0), 0);
  }, [runs]);

  // Saves the updated username to the backend.
  async function saveUsername() {
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      // Sends the new username to the backend.
      const res = await api.put("/users/username", { userName: newName });

      // Updates local user data with the new username.
      setUser(res.data.user);

      // Shows success message and closes edit mode.
      setMsg("Username updated!");
      setEditing(false);
    } catch (e) {
      // Shows backend error if available, otherwise default error message.
      setErr(e?.response?.data?.message || "Failed to update username");
    } finally {
      // Stops loading state after the request finishes.
      setSaving(false);
    }
  }

  // Shows a loading message while user data is being fetched.
  if (!user) {
    return (
      <AuthLayout>
        <div className="text-white/70">Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        {/* Top section with page title and back link */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Player Profile</h1>
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        {/* Error message shown when something goes wrong */}
        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

        {/* Success message shown after updating username */}
        {msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}

        {/* User profile card */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6">
          {/* User profile picture */}
          <img src={user.image} alt="" className="h-24 w-24 rounded-full object-cover" />

          <div className="w-full">
            {!editing ? (
              // Normal profile view
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  {/* User name */}
                  <div className="text-xl font-bold text-white">{user.userName}</div>

                  {/* User email */}
                  <div className="text-white/60 text-sm">{user.email}</div>
                </div>

                {/* Button to open username editing mode */}
                <button
                  onClick={() => {
                    setEditing(true);
                    setNewName(user.userName || "");
                    setErr("");
                    setMsg("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Edit Username
                </button>
              </div>
            ) : (
              // Username editing form
              <div className="space-y-3">
                <label className="block text-sm text-white/70">New Username</label>

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1027]/60 px-5 py-3 text-white outline-none"
                />

                <div className="flex gap-3">
                  {/* Button to save the new username */}
                  <button
                    disabled={saving}
                    onClick={saveUsername}
                    className={`rounded-xl bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 px-5 py-2 text-sm font-extrabold text-[#070a18] hover:brightness-110 transition ${
                      saving ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  {/* Button to cancel editing mode */}
                  <button
                    disabled={saving}
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary cards for total runs and total score */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <StatCard label="Total Runs" value={totalRuns} />
          <StatCard label="Total Score" value={totalScore} />
        </div>

        {/* Best score section by difficulty */}
        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-white">Best Scores by Mode</h2>

          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            <DiffCard title="Easy" data={finalStats?.easy} />
            <DiffCard title="Medium" data={finalStats?.medium} />
            <DiffCard title="Hard" data={finalStats?.hard} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

// Reusable card for showing a single summary number.
function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6 text-center">
      {/* Label for the stat */}
      <div className="text-white/60 text-sm">{label}</div>

      {/* Main stat value */}
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

// Reusable card for showing runs and best score for one difficulty mode.
function DiffCard({ title, data }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6">
      {/* Difficulty mode title */}
      <div className="text-lg font-extrabold text-white">{title}</div>

      {/* Stats for this difficulty mode */}
      <div className="mt-3 space-y-2 text-sm text-white/75">
        <div><b>Runs:</b> {data?.runs ?? 0}</div>
        <div><b>Best Score:</b> {data?.bestScore ?? 0}</div>
      </div>
    </div>
  );
}