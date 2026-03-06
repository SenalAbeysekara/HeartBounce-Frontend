// Imports React state management, shared auth page layout,
// routing tools, and API helper for backend requests.
import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

// This component shows the reset password page.
// It lets the user enter email, current password, and a new password.
export default function ForgotPassword() {
  // Used to move the user to another page after success.
  const navigate = useNavigate();

  // Stores the user's email input.
  const [email, setEmail] = useState("");

  // Stores the user's current password input.
  const [currentPassword, setCurrentPassword] = useState("");

  // Stores the user's new password input.
  const [newPassword, setNewPassword] = useState("");

  // Stores a success message to show on screen.
  const [msg, setMsg] = useState("");

  // Stores an error message to show on screen.
  const [err, setErr] = useState("");

  // Tracks whether the form is currently submitting.
  const [loading, setLoading] = useState(false);

  // Runs when the form is submitted.
  // It sends the reset password request to the backend.
  async function handleSubmit(e) {
    // Prevents the browser from refreshing the page.
    e.preventDefault();

    // Clears old messages before starting a new request.
    setErr("");
    setMsg("");

    // Shows loading state while the request is running.
    setLoading(true);

    try {
      // Sends the email, current password, and new password to the API.
      const res = await api.post("/users/reset-password", {
        email,
        currentPassword,
        newPassword,
      });

      // Shows success message from backend or a default message.
      setMsg(res.data.message || "Password updated!");

      // After a short delay, sends the user back to the login page.
      setTimeout(() => navigate("/login"), 900);
    } catch (e) {
      // Shows backend error message if available, otherwise default error text.
      setErr(e?.response?.data?.message || "Failed to update password");
    } finally {
      // Stops loading state after request finishes, whether success or fail.
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          {/* Decorative gradient layer inside the card */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

          {/* Soft border glow effect around the card */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            {/* Main page heading */}
            <h1 className="text-center text-4xl font-extrabold tracking-tight">
              Reset password
            </h1>

            {/* Small subtitle below the heading */}
            <p className="mt-2 text-center text-sm text-white/60">
              Set a New Password
            </p>

            {/* Shows error message only when an error exists */}
            {err && <p className="mt-4 text-center text-sm text-red-400">{err}</p>}

            {/* Shows success message only when a message exists */}
            {msg && <p className="mt-4 text-center text-sm text-emerald-300">{msg}</p>}

            {/* Password reset form */}
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {/* Email input field */}
              <Input label="Email" type="email" value={email} onChange={setEmail} />

              {/* Current password input field */}
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />

              {/* New password input field */}
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
              />

              {/* Submit button text changes while loading */}
              <GradientButton text={loading ? "UPDATING..." : "UPDATE PASSWORD"} disabled={loading} />
            </form>

            {/* Link to return back to login page */}
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

// Reusable input component for form fields.
// It receives label, input type, current value, and change handler as props.
function Input({ label, type, value, onChange }) {
  return (
    <div>
      {/* Field label shown above the input */}
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

// Reusable submit button with gradient styling.
// It can also be disabled while loading.
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
      {/* Inner overlay to create a glossy button effect */}
      <span className="absolute inset-2 rounded-xl bg-white/10" />

      {/* Button text shown above the overlay */}
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}