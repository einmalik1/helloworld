import { RootProvider } from "fumadocs-ui/provider/next";
import { Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
