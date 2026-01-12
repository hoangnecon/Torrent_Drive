import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiProvider } from "@/context/ApiContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colab Torrent Downloader",
  description: "High speed torrent downloader using Google Colab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
