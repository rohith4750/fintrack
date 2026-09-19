import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTrack - Smart Finance Collection & Loan Management Platform",
  description: "Enterprise grade finance management platform for weekly, monthly, daily collections, product finance, routes & agent tracking.",
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-['Plus_Jakarta_Sans',sans-serif] bg-slate-100 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
