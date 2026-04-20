export default function ActiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-8 lg:px-10">
      <div className="space-y-2 pb-6">
        <h1 className="text-2xl font-bold">Active Orders</h1>
        <p className="text-sm text-muted-foreground">
          Here you can view your active orders.
        </p>
      </div>
      {children}
    </div>
  );
}
