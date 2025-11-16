"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/utils/cn"

const Checkbox = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }>(
	({ className, checked, onCheckedChange, ...props }, ref) => {
		return (
			<button
				type="button"
				role="checkbox"
				aria-checked={checked}
				data-state={checked ? "checked" : "unchecked"}
				className={cn(
					"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
					className,
				)}
				onClick={() => onCheckedChange?.(!checked)}
				{...props}
				ref={ref}
			>
				{checked && <CheckIcon className="h-4 w-4" />}
			</button>
		)
	},
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
