"use client"

import { cn } from "@/utils/cn"

export const KeyBadge = ({ label, className }: { label: string; className?: string }) => {
	return (
		<kbd
			aria-hidden="true"
			className={cn(
				"-bottom-1.5 -right-1.5 pointer-events-none absolute hidden min-w-5 rounded border border-border bg-background/95 px-1 font-semibold text-[10px] text-muted-foreground uppercase shadow-sm md:inline dark:bg-background/75",
				className,
			)}
		>
			{label.toUpperCase()}
		</kbd>
	)
}
