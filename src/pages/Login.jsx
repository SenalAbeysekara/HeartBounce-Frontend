// Imports React state hook for handling form input and messages.
import { useState } from "react";

// Imports routing tools for page navigation and links.
import { Link, useNavigate } from "react-router-dom";

// Imports the shared layout used for authentication pages.
import AuthLayout from "./AuthLayout";

// Imports the API helper for backend requests.
import { api } from "../api/api";

// This component shows the login page.
export default function Login() {
  // Used to move the user to another page after login.
  const navigate = useNavigate();

  // Stores the email entered by the user.
  const [email, setEmail] = useState("");

  // Stores the password entered by the user.
  const [password, setPassword] = useState("");

  // Stores any error message from a failed login attempt.
  const [errorMessage, setErrorMessage] = useState("");

  // Runs when the login form is submitted.
  async function handleSubmit(e) {
    // Prevents the page from refreshing after form submit.
    e.preventDefault();

    // Clears any old error message before trying again.
    setErrorMessage("");

    try {
      // Sends the user's email and password to the backend login route.
      await api.post(
        "/users/login",
        { email, password },
        { withCredentials: true }
      );

      // If login is successful, go to the main menu page.
      navigate("/mainmenu");
    } catch (err) {
      // Shows backend error message if available, otherwise a default message.
      setErrorMessage(err?.response?.data?.message || "Failed to login");
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          {/* Decorative gradient layer inside the card */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

          {/* Soft highlight border around the card */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            {/* Main heading */}
            <h1 className="text-center text-4xl font-extrabold tracking-tight">
              Welcome back
            </h1>

            {/* Small subtitle below the heading */}
            <p className="mt-2 text-center text-sm text-white/60">
              Log In To The Arena.
            </p>

            {/* Error message shown only when login fails */}
            {errorMessage && (
              <p className="mt-4 text-center text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {/* Email input field */}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password input field */}
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Link to password reset page */}
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot"
                  className="text-sm text-white/70 hover:text-white transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <GradientButton text="LOGIN" />
            </form>

            {/* Link for users who do not have an account yet */}
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

// Reusable input field component for the form.
function Input({ label, type, value, onChange }) {
  return (
    <div>
      {/* Text label shown above the input */}
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

// Reusable gradient button component used for form submission.
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
      {/* Inner overlay for glossy button effect */}
      <span className="absolute inset-2 rounded-xl bg-white/10" />

      {/* Visible button text */}
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}