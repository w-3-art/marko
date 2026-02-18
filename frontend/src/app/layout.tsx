import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marko - Your AI CMO",
  description: "AI-powered marketing assistant for small businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
