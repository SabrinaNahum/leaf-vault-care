import { ReflectionApp } from "@/components/ReflectionApp";

// Force dynamic rendering to avoid SSR issues with indexedDB
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="w-full flex justify-center">
      <div className="flex flex-col gap-8 items-center w-full max-w-6xl px-3 md:px-0">
        <ReflectionApp />
      </div>
    </main>
  );
}

