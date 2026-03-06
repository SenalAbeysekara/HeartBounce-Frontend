// Imports React hooks for state management and side effects.
import { useEffect, useState } from "react";

// Imports the shared layout component used for page design.
import AuthLayout from "./AuthLayout";

// Imports routing tools for links and page navigation.
import { Link, useNavigate } from "react-router-dom";

// Imports the API helper for backend requests.
import { api } from "../api/api";

// This component shows the player's saved game history.
export default function ProgressLog() {
  // Used to move the user to another page if needed.
  const navigate = useNavigate();

  // Stores all saved game runs for the current user.
  const [runs, setRuns] = useState([]);

  // Stores an error message if something goes wrong.
  const [err, setErr] = useState("");

  // Runs when the page loads.
  // It checks if the user is logged in and then loads their saved runs.
  useEffect(() => {
    (async () => {
      try {
        // Verifies that the current user is logged in.
        await api.get("/users/me");

        // Gets the current user's saved game runs from the backend.
        const res = await api.get("/game/runs/me");

        // Saves the returned runs into state.
        setRuns(res.data.runs || []);
      } catch {
        // If the user is not logged in, send them to the login page.
        navigate("/login");
      }
    })();
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        {/* Top section with page title and back link */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Progress Log</h1>
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        {/* Shows an error message only when one exists */}
        {err && <p className="mt-4 text-red-400">{err}</p>}

        {/* Table container for the saved run history */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            {/* Table header */}
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Score</th>
              </tr>
            </thead>

            {/* Table body with all saved runs */}
            <tbody className="text-white/80">
              {runs.map((r) => (
                <tr key={r._id} className="border-t border-white/10">
                  {/* Date and time when this run was created */}
                  <td className="p-4">{new Date(r.createdAt).toLocaleString()}</td>

                  {/* Difficulty mode of this run */}
                  <td className="p-4 capitalize">{r.difficulty}</td>

                  {/* Score earned in this run */}
                  <td className="p-4 font-extrabold">{r.score}</td>
                </tr>
              ))}

              {/* Message shown when the user has no saved runs */}
              {runs.length === 0 && (
                <tr>
                  <td className="p-6 text-white/60" colSpan={3}>
                    No runs saved yet. Play and finish one run to create a log.
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