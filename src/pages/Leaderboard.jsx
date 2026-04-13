import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import { api } from "../api/api";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [top, setTop] = useState([]);
  const [err, setErr] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      try {
        await api.get("/users/me");
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        navigate("/login");
      }
    }

    checkLogin();
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          const res = await api.get("/run/leaderboard");
          setTop(res.data.top || []);
        } catch {
          setErr("Failed to load leaderboard");
        }
      })();
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    return (
      <AuthLayout>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white/70 backdrop-blur-xl">
          Loading...
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Leaderboard</h1>
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
                <th className="p-4">#</th>
                <th className="p-4">Player</th>
                <th className="p-4">Best Mode</th>
                <th className="p-4">Best Score</th>
                <th className="p-4">Achieved</th>
              </tr>
            </thead>

            <tbody className="text-white/80">
              {top.map((r, i) => (
                <tr
                  key={r.userId || r._id}
                  className={`border-t border-white/10 transition hover:bg-white/5 ${getRankRowStyle(
                    i
                  )}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{i + 1}</span>
                      {getRankIcon(i)}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.userImage || "/images/default.jpg"}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
                        alt={r.userName || "Player"}
                      />
                      <span className="font-semibold text-white">
                        {r.userName}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 capitalize">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      {r.bestDifficulty || "-"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-lg font-extrabold text-white">
                      {r.bestScore ?? 0}
                    </span>
                  </td>

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

function getRankRowStyle(index) {
  if (index === 0) {
    return "bg-yellow-400/10 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.25)]";
  }

  if (index === 1) {
    return "bg-slate-300/10 shadow-[inset_0_0_0_1px_rgba(203,213,225,0.22)]";
  }

  if (index === 2) {
    return "bg-orange-400/10 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.22)]";
  }

  return "";
}

function getRankIcon(index) {
  if (index === 0) {
    return <FaTrophy className="text-yellow-300" />;
  }

  if (index === 1) {
    return <FaMedal className="text-slate-200" />;
  }

  if (index === 2) {
    return <FaAward className="text-orange-300" />;
  }

  return null;
}