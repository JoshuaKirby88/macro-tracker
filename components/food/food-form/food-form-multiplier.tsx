"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type z from "zod/v3"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import type { updateFoodSchema } from "@/convex/schema"
import type { FoodFormField } from "./food-form"

export const FoodFormMultiplier = (props: { form: UseFormReturn<z.infer<typeof updateFoodSchema>>; fields: FoodFormField[] }) => {
	const [multiplier, setMultiplier] = useState(1)
	const numericFieldKeys = props.fields.filter((f) => f.isNumber).map((f) => f.value)

	const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMultiplierValue = parseFloat(e.target.value)
		const targetMultiplier = Number.isFinite(newMultiplierValue) ? newMultiplierValue : 1

		if (multiplier === targetMultiplier) return

		if (multiplier === 0) {
			setMultiplier(targetMultiplier)
			return
		}

		for (const key of numericFieldKeys) {
			const currentVal = props.form.getValues(key as any)
			const num = Number(currentVal)
			if (!Number.isFinite(num)) continue

			const baseValue = num / multiplier
			const newValue = baseValue * targetMultiplier

			const roundedValue = Number(newValue.toPrecision(12))

			props.form.setValue(key as any, roundedValue, { shouldDirty: true })
		}

		setMultiplier(targetMultiplier)
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-full">
					<XIcon className="stroke-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<div className="space-y-3">
					<h3 className="font-medium">Multiplier</h3>
					<p className="text-muted-foreground text-sm">Enter a number to multiply all numeric fields currently filled in this form.</p>
					<Input type="number" step="any" value={multiplier} onChange={handleMultiplierChange} />
				</div>
			</PopoverContent>
		</Popover>
	)
}
