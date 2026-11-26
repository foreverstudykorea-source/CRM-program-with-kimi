"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/format";

export function RevenueChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div className="h-72 w-full" aria-label="12 oylik tushum grafigi">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={58} />
          <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-lg border border-border bg-popover p-3 text-sm shadow-md"><p className="font-medium">{label}</p><p className="mt-1 tabular-nums text-primary">{formatMoney(Number(payload[0].value))}</p></div> : null} />
          <Bar dataKey="value" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
