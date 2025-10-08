import { Suspense } from "react";
import SharePage from "./share-screen";

export const dynamic = "force-dynamic"; // avoids prerendering issues

export default function Page() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh grid place-items-center text-font-secondary">
        Loading…
      </main>
    }>
      <SharePage />
    </Suspense>
  );
}

