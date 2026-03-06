// Imports React state hook for handling form input and error messages.
import { useState } from "react";

// Imports routing tools for page links and navigation.
import { Link, useNavigate } from "react-router-dom";

// Imports the shared layout used for authentication pages.
import AuthLayout from "./AuthLayout";

// Imports the API helper for sending requests to the backend.
import { api } from "../api/api";

// This component shows the user registration page.
export default function Register() {
  // Used to move the user to another page after successful registration.
  const navigate = useNavigate();

  // Stores the email entered by the user.
  const [email, setEmail] = useState("");

  // Stores the username entered by the user.
  const [userName, setUserName] = useState("");

  // Stores the password entered by the user.
  const [password, setPassword] = useState("");

  // Stores an error message if registration fails.
  const [errorMessage, setErrorMessage] = useState("");

  // Runs when the registration form is submitted.
  const handleSubmit = async (e) => {
    // Prevents the page from refreshing when the form is submitted.
    e.preventDefault();

    try {
      // Sends the user's registration details to the backend.
      await api.post("/users/register", { email, userName, password });

      // If registration is successful, go to the login page.
      navigate("/login");
    } catch (error) {
      // Shows the backend error message if available.
      setErrorMessage(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-2xl shadow-2xl">
          {/* Decorative gradient layer inside the card */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

          {/* Soft border highlight around the card */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

          <div className="relative">
            {/* Main page heading */}
            <h1 className="text-center text-4xl font-extrabold tracking-tight">
              Create account
            </h1>

            {/* Small subtitle below the heading */}
            <p className="mt-2 text-center text-sm text-white/60">
              Start Your Run In Seconds
            </p>

            {/* Error message shown only when registration fails */}
            {errorMessage && (
              <p className="text-red-500 text-center mt-2">{errorMessage}</p>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {/* Email input field */}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Username input field */}
              <Input
                label="Username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />

              {/* Password input field */}
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Submit button */}
              <GradientButton text="REGISTER" />
            </form>

            {/* Link for users who already have an account */}
            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">Already have an account?</p>
              <Link
                to="/login"
                className="mt-1 inline-block text-sm font-semibold text-cyan-200 hover:text-white transition"
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

// Reusable input field component used in the registration form.
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
        className="
          w-full rounded-2xl border border-white/10
          bg-[#0b1027]/60 px-5 py-4
          text-white placeholder:text-white/40
          outline-none
          focus:border-fuchsia-300/30 focus:ring-2 focus:ring-fuchsia-300/10
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
      {/* Inner overlay for glossy button styling */}
      <span className="absolute inset-2 rounded-xl bg-white/10" />

      {/* Visible text shown inside the button */}
      <span className="relative text-base font-extrabold tracking-wide text-[#070a18]">
        {text}
      </span>
    </button>
  );
}