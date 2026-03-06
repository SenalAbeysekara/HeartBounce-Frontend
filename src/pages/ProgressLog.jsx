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
        await api.get("/users/me"); // protect page
        const res = await api.get("/game/runs/me");
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
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
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
              {runs.map((r) => (
                <tr key={r._id} className="border-t border-white/10">
                  <td className="p-4">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-4 capitalize">{r.difficulty}</td>
                  <td className="p-4 font-extrabold">{r.score}</td>
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