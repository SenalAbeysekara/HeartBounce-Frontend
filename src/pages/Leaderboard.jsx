// Imports React hooks for state management and side effects.
import { useEffect, useState } from "react";

// Imports the shared page layout component.
import AuthLayout from "./AuthLayout";

// Imports Link for navigation between pages.
import { Link } from "react-router-dom";

// Imports the API helper for backend requests.
import { api } from "../api/api";

// This component shows the leaderboard page.
export default function Leaderboard() {
  // Stores the leaderboard data from the backend.
  const [top, setTop] = useState([]);

  // Stores any error message if loading fails.
  const [err, setErr] = useState("");

  // Loads leaderboard data when the component first appears.
  useEffect(() => {
    (async () => {
      try {
        // Gets the leaderboard data from the backend.
        const res = await api.get("/game/leaderboard");

        // Saves the returned player rankings into state.
        setTop(res.data.top || []);
      } catch {
        // Shows an error message if the request fails.
        setErr("Failed to load leaderboard");
      }
    })();
  }, []);

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        {/* Top section with page title and back link */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Leaderboard</h1>
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        {/* Shows an error message only when loading fails */}
        {err && <p className="mt-4 text-red-400">{err}</p>}

        {/* Table container for leaderboard results */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            {/* Table headings */}
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Player</th>
                <th className="p-4">Best Mode</th>
                <th className="p-4">Best Score</th>
                <th className="p-4">Achieved</th>
              </tr>
            </thead>

            {/* Table body with player rows */}
            <tbody className="text-white/80">
              {top.map((r, i) => (
                <tr key={r.userId || r._id} className="border-t border-white/10">
                  {/* Player rank number */}
                  <td className="p-4">{i + 1}</td>

                  {/* Player image and name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.userImage}
                        className="h-8 w-8 rounded-full object-cover"
                        alt=""
                      />
                      <span className="font-semibold">{r.userName}</span>
                    </div>
                  </td>

                  {/* Player's best difficulty mode */}
                  <td className="p-4 capitalize">{r.bestDifficulty || "-"}</td>

                  {/* Player's highest score */}
                  <td className="p-4 font-extrabold">{r.bestScore ?? 0}</td>

                  {/* Date and time when the best score was achieved */}
                  <td className="p-4">
                    {r.bestAt ? new Date(r.bestAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}

              {/* Shows this row when there are no leaderboard results */}
              {top.length === 0 && (
                <tr>
                  <td className="p-6 text-white/60" colSpan={5}>
                    No scores yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthLayout>
  );
}