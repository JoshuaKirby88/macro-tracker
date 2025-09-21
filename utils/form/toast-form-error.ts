import { toast } from "sonner"

export const toastFormError = (errors: any) => {
	toast.error(getFirstMessage(errors) ?? "Please fix the form errors")
}

const getFirstMessage = (obj: any): string | undefined => {
	if (!obj) return undefined
	if (obj?.message) return obj.message as string
	for (const v of Object.values(obj)) {
		const m = typeof v === "object" ? getFirstMessage(v) : undefined
		if (m) return m
	}
	return undefined
}
