import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Encrypted Nightly Reflection",
  description: "A confidential reflection journal using Zama FHE technology",
  icons: {
    icon: "/reflection-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex flex-col w-full min-h-screen">
          <div className="flex-1 flex justify-center w-full">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}

