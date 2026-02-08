export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
