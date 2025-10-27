import type { Metadata } from "next";
import { Figtree, Inter_Tight, Plus_Jakarta_Sans, Fira_Mono } from "next/font/google";
import { UIProvider } from "@/context";
import "./globals.css";

// MoSurveys Typography System
// Primary font for body text - clean, friendly, highly readable
const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Secondary font for headings - condensed sans serif with strong hierarchy
const interTight = Inter_Tight({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

// Accent font for buttons, navigation, UI tags - crisp and geometric
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// Monospace font for code snippets and data values
const firaMono = Fira_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoSurveys - Create Surveys That Get Results",
  description: "Build, share, and analyze surveys with ease. Collect valuable feedback from your audience with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${interTight.variable} ${plusJakartaSans.variable} ${firaMono.variable} antialiased`}
      >
        <UIProvider>
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
