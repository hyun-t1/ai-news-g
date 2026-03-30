import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "AI News Radar",
  description: "전 세계 AI 뉴스를 수집, 번역, 추천, 아카이빙하는 개인용 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
