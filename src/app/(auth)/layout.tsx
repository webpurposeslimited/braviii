export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="fixed inset-0 bg-hero-gradient" />
      <div className="fixed inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[128px]" />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
