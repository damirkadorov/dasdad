import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayDemo - Smart Banking App",
  description: "Experience the future of banking with instant transfers, virtual cards, and NFC payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
