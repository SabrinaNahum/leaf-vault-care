import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";

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
      <body className={`reflection-bg text-foreground antialiased`}>
        <div className="fixed inset-0 w-full h-full reflection-bg z-[-20] min-w-[850px]"></div>
        <main className="flex flex-col w-full min-h-screen">
          <nav className="flex w-full max-w-7xl mx-auto px-3 md:px-0 h-fit py-10 justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/reflection-logo.svg"
                alt="Encrypted Nightly Reflection Logo"
                width={120}
                height={120}
                priority
              />
              <h1 className="text-2xl font-bold text-white">Encrypted Nightly Reflection</h1>
            </div>
          </nav>
          <div className="flex-1 flex justify-center w-full">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}

