export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-indigo-600 p-12 text-white">
        <a href="/" className="text-2xl font-bold">
          PowerPicker
        </a>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Make every voice count.
          </h2>
          <p className="mt-4 text-lg text-indigo-200">
            Run secure elections and polls for your school, university, office,
            or community — in minutes.
          </p>
        </div>
        <p className="text-sm text-indigo-300">
          &copy; {new Date().getFullYear()} PowerPicker
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
