import { cva, type VariantProps } from "class-variance-authority"
import { Loader } from "lucide-react"
import { cn } from "@/utils/cn"

const spinnerVariants = cva("animate-spin", {
	variants: {
		size: {
			sm: "w-2 h-2",
			md: "w-4 h-4",
			slimFit: "w-5 h-5",
			lg: "w-6 h-6",
			icon: "h-10 w-10",
		},
	},
	defaultVariants: {
		size: "md",
	},
})

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {}

export const Spinner = ({ size, className }: SpinnerProps & { className?: string }) => {
	return <Loader className={cn(spinnerVariants({ size }), className)} />
}
