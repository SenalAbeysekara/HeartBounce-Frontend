import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { api } from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.post("/users/register", { email, userName, password });

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            <h1 className="text-center text-4xl font-extrabold tracking-tight text-white">
              Create account
            </h1>

            <p className="mt-2 text-center text-sm text-white/60">
              Start Your Run In Seconds
            </p>

            {errorMessage && (
              <p className="mt-2 text-center text-red-500">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="mt-2 text-center text-green-500">{successMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<FaEnvelope />}
              />

              <Input
                label="Username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                icon={<FaUser />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FaLock />}
              />

              <GradientButton text="REGISTER" />
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">Already have an account?</p>
              <Link
                to="/login"
                className="mt-1 inline-block text-sm font-semibold text-cyan-200 transition hover:text-white"
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

function Input({ label, type, value, onChange, icon }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/45">
          {icon}
        </span>

        <input
          type={type}
          placeholder={label}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-white/10 bg-[#0b1027]/60 py-4 pl-12 pr-5 text-white placeholder:text-white/40 outline-none transition focus:border-fuchsia-300/30 focus:ring-2 focus:ring-fuchsia-300/10"
        />
      </div>
    </div>
  );
}

function GradientButton({ text }) {
  return (
    <button
      type="submit"
      className="relative mt-3 w-full rounded-2xl bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 py-4 shadow-xl transition hover:brightness-110 active:scale-[0.99]"
    >
      <span className="absolute inset-2 rounded-xl bg-white/10" />
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}