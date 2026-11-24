"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex size-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground", className)} {...props} />;
}

function CommandDialog({ title = "Buyruqlar", description = "Sahifa yoki buyruq qidirish", children, ...props }: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return <Dialog {...props}><DialogContent className="top-[15%] translate-y-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}><DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><Command>{children}</Command></DialogContent></Dialog>;
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return <div className="flex h-14 items-center gap-3 border-b border-border px-4"><Search className="size-4 shrink-0 text-muted-foreground" /><CommandPrimitive.Input className={cn("flex h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50", className)} {...props} /></div>;
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("max-h-80 overflow-y-auto overflow-x-hidden p-2", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("py-10 text-center text-sm text-muted-foreground", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...props} />;
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} {...props} />;
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("relative flex min-h-11 cursor-default select-none items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground", className)} {...props} />;
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
}

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
