"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { toggleSupportSignup } from "@/features/support/actions";
import { Button } from "@/components/ui/button";

export function SupportSignupButton({ lessonId, initialSignedUp, disabled = false }: { lessonId: string; initialSignedUp: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [signedUp, setSignedUp] = useState(initialSignedUp);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onToggle() {
    setPending(true);
    setError(null);
    const result = await toggleSupportSignup(lessonId);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const next = Boolean(result.signedUp);
    setSignedUp(next);
    toast.success(next ? "Supportga yozildingiz" : "Supportdan chiqdingiz");
    router.refresh();
  }

  return <div className="space-y-2"><Button variant="outline" className={signedUp ? "border-success/30 bg-success/10 text-success" : undefined} onClick={onToggle} disabled={pending || disabled}>{pending ? <LoaderCircle className="animate-spin" /> : signedUp ? <Check /> : <Plus />}{pending ? "Saqlanmoqda..." : signedUp ? "Supportdasiz — chiqish" : "Supportda qolaman"}</Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>;
}
