import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHS Boys Soccer Program Hub",
  description:
    "Season management hub for the Covington High School boys soccer program.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
