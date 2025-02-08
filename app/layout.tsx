import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ['400','600','700']
});

export const metadata: Metadata = {
  title: "Figma",
  description: "This is a figma clone created using fabric js library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${workSans.className} bg-gray-700`}
      >
        <Room>
            {children}
        </Room>
      </body>
    </html>
  );
}
