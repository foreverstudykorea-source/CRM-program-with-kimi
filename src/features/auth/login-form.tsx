"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole, Phone } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { formatPhoneInput } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginFormValues) {
    const result = await loginAction(values, nextPath);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {form.formState.errors.root?.server && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{form.formState.errors.root.server.message}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon raqam</Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="phone" type="tel" inputMode="numeric" autoComplete="username" placeholder="+998 90 123 45 67" className="pl-10" aria-invalid={Boolean(form.formState.errors.phone)} aria-describedby={form.formState.errors.phone ? "phone-error" : undefined} disabled={form.formState.isSubmitting} {...form.register("phone", { onChange: (event) => form.setValue("phone", formatPhoneInput(event.target.value), { shouldValidate: event.target.value.length > 15 }) })} />
        </div>
        {form.formState.errors.phone && <p id="phone-error" className="text-[13px] text-destructive">{form.formState.errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Parol</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Parolingizni kiriting" className="pl-10 pr-12" aria-invalid={Boolean(form.formState.errors.password)} aria-describedby={form.formState.errors.password ? "password-error" : undefined} disabled={form.formState.isSubmitting} {...form.register("password")} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground" aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"} disabled={form.formState.isSubmitting}>
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.password && <p id="password-error" className="text-[13px] text-destructive">{form.formState.errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <LoaderCircle className="animate-spin" />}
        {form.formState.isSubmitting ? "Kirilmoqda..." : "Tizimga kirish"}
      </Button>
    </form>
  );
}
