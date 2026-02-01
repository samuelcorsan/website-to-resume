import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio website to resume | AI-powered generator",
  description: "Transform your portfolio or website into a professional PDF resume in seconds. AI-powered tool that extracts your experience, skills, and projects to create a polished resume.",
  keywords: ["resume generator", "portfolio to resume", "PDF resume", "AI resume", "resume builder", "CV generator"],
  authors: [{ name: "Portfolio to Resume" }],
  openGraph: {
    title: "Portfolio website to resume | AI-powered generator",
    description: "Transform your portfolio or website into a professional PDF resume in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio website to resume | AI-powered generator",
    description: "Transform your portfolio or website into a professional PDF resume in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
