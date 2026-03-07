import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export default function Leaderboard() {
  const [top, setTop] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Loads leaderboard data from run routes
        const res = await api.get("/run/leaderboard");
        setTop(res.data.top || []);
      } catch {
        setErr("Failed to load leaderboard");
      }
    })();
  }, []);

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Leaderboard</h1>
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        {err && <p className="mt-4 text-red-400">{err}</p>}

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Player</th>
                <th className="p-4">Best Mode</th>
                <th className="p-4">Best Score</th>
                <th className="p-4">Achieved</th>
              </tr>
            </thead>

            <tbody className="text-white/80">
              {top.map((r, i) => (
                <tr key={r.userId || r._id} className="border-t border-white/10">
                  <td className="p-4">{i + 1}</td>

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

                  <td className="p-4 capitalize">{r.bestDifficulty || "-"}</td>
                  <td className="p-4 font-extrabold">{r.bestScore ?? 0}</td>
                  <td className="p-4">
                    {r.bestAt ? new Date(r.bestAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}

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