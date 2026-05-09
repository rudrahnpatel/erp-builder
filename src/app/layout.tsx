import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DbKeepalive } from "@/components/providers/DbKeepalive";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Mosaic — Business ERP for Indian SMEs",
    template: "%s · Mosaic",
  },
  description:
    "Install modules, design schemas, compose pages. Mosaic is a no-code ERP platform built for Indian SMEs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[var(--primary)] focus:text-[var(--primary-foreground)] focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ThemeProvider>
            <DbKeepalive />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
