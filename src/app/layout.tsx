import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warp Suite",
  description: "AI-native workspace for docs, sheets, and slides.",
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkServerEnabled = Boolean(
  clerkPublishableKey && process.env.CLERK_SECRET_KEY,
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (clerkServerEnabled) {
    await auth();
  }

  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        {clerkServerEnabled ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
