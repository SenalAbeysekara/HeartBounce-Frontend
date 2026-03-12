export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060815] text-white">

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-130 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/5 top-1/10 h-96 w-130 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-56 top-28 h-96 w-130 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/6 -bottom-64 h-160 w-160 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/5 h-96 w-130 rounded-full bg-fuchsia-500/15 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.65)_100%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}