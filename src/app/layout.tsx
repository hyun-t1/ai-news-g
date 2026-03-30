import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI News Radar",
  description: "글로벌 AI 뉴스를 수집하고 번역, 추천, 아카이빙하는 개인용 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={cn("font-sans", geist.variable)} lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
