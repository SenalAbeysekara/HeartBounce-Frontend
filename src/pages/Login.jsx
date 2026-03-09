import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { api } from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      await api.post(
        "/users/login",
        { email, password },
        { withCredentials: true }
      );

      navigate("/mainmenu");
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Failed to login");
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          {/* Card background effects */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            <h1 className="text-center text-4xl font-extrabold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-center text-sm text-white/60">
              Log In To The Arena.
            </p>

            {errorMessage && (
              <p className="mt-4 text-center text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <GradientButton text="LOGIN" />
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">New here?</p>
              <Link
                to="/register"
                className="mt-1 inline-block text-sm font-semibold text-fuchsia-200 hover:text-white transition"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

// Reusable form input
function Input({ label, type, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>

      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
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

// Reusable gradient submit button
function GradientButton({ text }) {
  return (
    <button
      type="submit"
      className="
        relative mt-3 w-full rounded-2xl py-4
        bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-400
        shadow-xl
        hover:brightness-110 active:scale-[0.99] transition
      "
    >
      <span className="absolute inset-2 rounded-xl bg-white/10" />
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}