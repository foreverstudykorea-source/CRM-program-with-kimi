import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" className={cn("flex min-h-11 w-full items-center rounded-lg border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20", className)} {...props} />;
}
function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2 px-3 text-muted-foreground [&_svg]:size-4", className)} {...props} />;
}
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return <Input className={cn("flex-1 border-0 bg-transparent focus-visible:ring-0", className)} {...props} />;
}
function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <Textarea className={cn("flex-1 border-0 bg-transparent focus-visible:ring-0", className)} {...props} />;
}
function InputGroupButton({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("inline-flex size-9 items-center justify-center rounded-md hover:bg-muted", className)} {...props} />;
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea };
