import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

// Inter carries the body copy, labels and controls; Plus Jakarta Sans is the
// heading face (see `--font-heading` in globals.css). Both ship as variable
// fonts, so one request each covers every weight the UI uses. Matches
// cliptech-admin so the two apps read as one product.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClipTech",
  description: "Get paid for the clips you post.",
};

export const viewport: Viewport = {
  // This is a phone-first app with a fixed bottom bar. `viewport-fit=cover`
  // is what makes env(safe-area-inset-bottom) resolve to anything on iOS;
  // without it the bar sits under the home indicator.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
