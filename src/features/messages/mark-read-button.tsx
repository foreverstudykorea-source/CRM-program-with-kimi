"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { markMessageRead } from "@/features/messages/actions";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return <Button size="sm" variant="outline" disabled={pending} onClick={async () => { setPending(true); await markMessageRead(messageId); setPending(false); router.refresh(); }}>{pending ? <LoaderCircle className="animate-spin" /> : <Check />}O‘qilgan deb belgilash</Button>;
}
