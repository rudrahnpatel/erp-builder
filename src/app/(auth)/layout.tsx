export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Soft ambient background glows to complement the blue premium aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] bg-primary/10 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] bg-[#06b6d4]/10 pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}
