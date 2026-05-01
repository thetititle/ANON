import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안온",
  description: "소중한 분을 기억하는 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
