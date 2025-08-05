"use client";

import { Chat } from "@/components/chat/chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-br from-amber-50 to-yellow-50">
      <div className="w-full max-w-4xl">
        <Chat />
      </div>
    </main>
  );
}
