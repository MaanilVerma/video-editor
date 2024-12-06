import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Video Editor - Maanil Verma",
  description: "Video Editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0B] text-white min-h-screen">
        <div className="px-4 py-6">
          <div className="max-w-[1920px] mx-auto">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
