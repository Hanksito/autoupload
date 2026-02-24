import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perihelion — Social Media Scheduler",
  description: "Schedule and publish Reels to Instagram, TikTok, YouTube, and X all at once",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
