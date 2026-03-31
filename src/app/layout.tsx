import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PowerPicker — Trusted Voting Platform",
  description: "A modern, trusted voting platform for schools, universities, organisations, and communities.",
  applicationName: "PowerPicker",
  appleWebApp: {
    capable: true,
    title: "PowerPicker",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192" }],
  },
  keywords: ["voting", "election", "poll", "ballot", "online voting"],
  openGraph: {
    title: "PowerPicker — Trusted Voting Platform",
    description: "Run secure, anonymous elections for your school, organisation, or community.",
    type: "website",
    siteName: "PowerPicker",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
