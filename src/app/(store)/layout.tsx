export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-accent-cyan selection:text-black">
      {children}
    </div>
  );
}
