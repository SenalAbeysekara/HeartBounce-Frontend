import { useEffect, useMemo, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function PlayerProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [runs, setRuns] = useState([]);
  const [diffStats, setDiffStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get("/users/me");
        setUser(meRes.data.user);
        setNewName(meRes.data.user.userName || "");

        // Load user runs and profile stats from run routes
        const runsRes = await api.get("/run/runs/me");
        const myRuns = runsRes.data.runs || [];
        setRuns(myRuns);

        try {
          const statsRes = await api.get("/run/profile-stats");
          setDiffStats(statsRes.data.stats);
        } catch {
          setDiffStats(null);
        }
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  const totalRuns = runs.length;

  // Fallback stats calculated from fetched runs
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

  const finalStats = useMemo(() => {
    const s = diffStats || computedStats;

    const sumRuns =
      (s?.easy?.runs || 0) +
      (s?.medium?.runs || 0) +
      (s?.hard?.runs || 0);

    if (totalRuns > 0 && sumRuns === 0) return computedStats;

    return s;
  }, [diffStats, computedStats, totalRuns]);

  const totalScore = useMemo(() => {
    return runs.reduce((sum, r) => sum + (r.score || 0), 0);
  }, [runs]);

  async function saveUsername() {
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const res = await api.put("/users/username", { userName: newName });
      setUser(res.data.user);
      setMsg("Username updated!");
      setEditing(false);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update username");
    } finally {
      setSaving(false);
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
    <AuthLayout>
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Player Profile</h1>
          <Link to="/mainmenu" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
        {msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}

        <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6 sm:flex-row">
          <img src={user.image} alt="" className="h-24 w-24 rounded-full object-cover" />

          <div className="w-full">
            {!editing ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xl font-bold text-white">{user.userName}</div>
                  <div className="text-sm text-white/60">{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    setEditing(true);
                    setNewName(user.userName || "");
                    setErr("");
                    setMsg("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Edit Username
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm text-white/70">New Username</label>

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1027]/60 px-5 py-3 text-white outline-none"
                />

                <div className="flex gap-3">
                  <button
                    disabled={saving}
                    onClick={saveUsername}
                    className={`rounded-xl bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 px-5 py-2 text-sm font-extrabold text-[#070a18] transition hover:brightness-110 ${
                      saving ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    disabled={saving}
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Runs" value={totalRuns} />
          <StatCard label="Total Score" value={totalScore} />
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-white">Best Scores by Mode</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <DiffCard title="Easy" data={finalStats?.easy} />
            <DiffCard title="Medium" data={finalStats?.medium} />
            <DiffCard title="Hard" data={finalStats?.hard} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

// Reusable summary card
function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6 text-center">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

// Reusable difficulty stats card
function DiffCard({ title, data }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1027]/60 p-6">
      <div className="text-lg font-extrabold text-white">{title}</div>

      <div className="mt-3 space-y-2 text-sm text-white/75">
        <div><b>Runs:</b> {data?.runs ?? 0}</div>
        <div><b>Best Score:</b> {data?.bestScore ?? 0}</div>
      </div>
    </div>
  );
}