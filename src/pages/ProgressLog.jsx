import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function ProgressLog() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await api.get("/users/me");

        const res = await api.get("/run/runs/me");
        setRuns(res.data.runs || []);
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Progress Log</h1>
          <Link
            to="/mainmenu"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ← Back
          </Link>
        </div>

        {err && <p className="mt-4 text-red-400">{err}</p>}

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Score</th>
              </tr>
            </thead>

            <tbody className="text-white/80">
              {runs.map((r, i) => (
                <tr
                  key={r._id}
                  className={`border-t border-white/10 transition hover:bg-white/5 ${
                    i % 2 === 0 ? "bg-white/[0.03]" : ""
                  }`}
                >
                  <td className="p-4">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4 capitalize">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        r.difficulty === "easy"
                          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                          : r.difficulty === "medium"
                          ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
                          : r.difficulty === "hard"
                          ? "border-rose-300/30 bg-rose-400/10 text-rose-200"
                          : "border-white/10 bg-white/10 text-white/80"
                      }`}
                    >
                      {r.difficulty}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-lg font-extrabold text-white">
                      {r.score}
                    </span>
                  </td>
                </tr>
              ))}

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