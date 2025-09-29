import type { FieldValues, UseFormReturn } from "react-hook-form"
import { Input } from "./shadcn/input"

export const FormNumberInput = <T extends FieldValues>(props: { form: UseFormReturn<T, unknown, T>; value: keyof T }) => {
	return (
		<Input
			type="number"
			inputMode="decimal"
			step="any"
			{...props.form.register(props.value as any, {
				setValueAs: (v) => {
					if (v === "" || v === null || v === undefined) return undefined
					const n = typeof v === "number" ? v : Number(v)
					return Number.isNaN(n) ? undefined : n
				},
			})}
		/>
	)
}
