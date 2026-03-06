import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/users/reset-password", {
        email,
        currentPassword,
        newPassword,
      });

      setMsg(res.data.message || "Password updated!");
      setTimeout(() => navigate("/login"), 900);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            <h1 className="text-center text-4xl font-extrabold tracking-tight">
              Reset password
            </h1>
            <p className="mt-2 text-center text-sm text-white/60">
              Set a New Password
            </p>

            {err && <p className="mt-4 text-center text-sm text-red-400">{err}</p>}
            {msg && <p className="mt-4 text-center text-sm text-emerald-300">{msg}</p>}

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
              />

              <GradientButton text={loading ? "UPDATING..." : "UPDATE PASSWORD"} disabled={loading} />
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-block text-sm font-semibold text-cyan-200 hover:text-white transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function Input({ label, type, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="
          w-full rounded-2xl border border-white/10
          bg-[#0b1027]/60 px-5 py-4
          text-white placeholder:text-white/40
          outline-none
          focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-300/10
          transition
        "
      />
    </div>
  );
}

function GradientButton({ text, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`
        relative mt-3 w-full rounded-2xl py-4
        bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-400
        shadow-xl
        hover:brightness-110 active:scale-[0.99] transition
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <span className="absolute inset-2 rounded-xl bg-white/10" />
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}