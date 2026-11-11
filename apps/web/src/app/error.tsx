"use client";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

export default function ErrorPage({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className="page page--narrow">
      <Notice tone="danger">
        <h1>We couldn’t load this page</h1>
        <p>Your connection may be unstable. Nothing has been submitted or charged.</p>
        <Button onClick={reset}>Try again</Button>
      </Notice>
    </div>
  );
}
