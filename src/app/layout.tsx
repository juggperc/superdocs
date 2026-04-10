import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warp Suite",
  description: "AI-native workspace for docs, sheets, and slides.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth();

  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
