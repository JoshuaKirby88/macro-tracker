import { toast } from "sonner"

export const toastFormError = (errors: any) => {
	toast.error(getFirstMessage(errors) ?? "Please fix the form errors")
}

const getFirstMessage = (obj: any): string | undefined => {
	if (!obj) return undefined
	if (obj?.message) return obj.message as string
	for (const [key, value] of Object.entries(obj)) {
		const m = typeof value === "object" ? getFirstMessage(value) : undefined
		if (m) return `${key}: ${m}`
	}
	return undefined
}
