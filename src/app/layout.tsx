import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Street Empire: Business Wars",
  description: "2D Action Shooting Game with Avatar Creation & Beatmaker by Justin Devon Mitchell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-rajdhani bg-black text-white overflow-hidden">
        <div className="min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}