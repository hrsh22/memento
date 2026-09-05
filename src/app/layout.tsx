import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Manrope } from "next/font/google";
import "./globals.css";
const sans = DM_Sans({ variable: "--font-sans-body", subsets: ["latin"] });
const display = Manrope({ variable: "--font-display", subsets: ["latin"] });
const mono = DM_Mono({
  variable: "--font-mono-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});
export const metadata: Metadata = {
  title: "Memento — A memory worth keeping",
  description:
    "An autonomous memory treasury for AI agents. Watch it protect useful knowledge, respect its storage budget, and verify every byte on Filecoin.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
