import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIAKAD — Sistem Akademik Universitas",
  description: "Sistem Informasi Akademik Universitas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
