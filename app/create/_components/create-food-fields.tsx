import { type Control, Controller, type UseFormRegister } from "react-hook-form"
import { ImagePicker } from "@/components/image-picker"
import { Input } from "@/components/shadcn/input"
import type { Food } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"

export type CreateFoodFieldsProps<TFieldValues extends Record<string, unknown> = Record<string, unknown>> = {
	control: Control<TFieldValues>
	register: UseFormRegister<TFieldValues>
	fields: { value: keyof Food; title?: string; isOptional?: boolean; isGram?: boolean; isNumber?: boolean }[]
	getDefaultQueryOnOpen: () => string
}

export const CreateFoodFields = <TFieldValues extends Record<string, unknown> = Record<string, unknown>>(props: CreateFoodFieldsProps<TFieldValues>) => {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Controller
				name={"image" as any}
				control={props.control}
				render={({ field }) => <ImagePicker value={field.value as string} onChange={field.onChange} getDefaultQueryOnOpen={props.getDefaultQueryOnOpen} />}
			/>

			{props.fields.map((field) => (
				<div key={field.value} className="grid gap-1">
					<label htmlFor={field.value} className="text-muted-foreground text-sm">
						{field.title ?? capitalize(field.value)} {field.isOptional ? "(optional)" : ""} {field.isGram ? "(g)" : ""}
					</label>
					<Input {...props.register(field.value as any, { valueAsNumber: field.isNumber })} autoFocus={field.value === "name"} />
				</div>
			))}
		</div>
	)
}
