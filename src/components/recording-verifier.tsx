"use client";
import { useState } from "react";
import { LoaderCircle, Fingerprint } from "lucide-react";
import { Button } from "./ui/button";
export function RecordingVerifier() {
  const [loading, setLoading] = useState(false),
    [message, setMessage] = useState("");
  async function verify() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/showcase", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(
        data.verified
          ? "Verified now: recording signature, " +
              data.decisions.length +
              " signed decisions, and " +
              data.archive.retrievalCopies.length +
              " independently retrieved provider copies. Checked " +
              new Date(data.checkedAt).toLocaleTimeString() +
              "."
          : "Verification did not pass. Inspect the original recording and receipts.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Verification unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <Button onClick={() => void verify()} disabled={loading}>
        {loading ? (
          <LoaderCircle className="spin" size={16} />
        ) : (
          <Fingerprint size={16} />
        )}{" "}
        {loading ? "Retrieving both copies…" : "Verify this run independently"}
      </Button>
      {message && (
        <p role="status" className="run-verify-message">
          {message}
        </p>
      )}
    </div>
  );
}
