import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { ImagePicker } from "@/components/image-picker"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardFooter } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { createFoodSchema, type Food } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"
import { toastFormError } from "@/utils/form/toast-form-error"

type Field = { value: keyof Food; title?: string; isOptional?: boolean; isGram?: boolean; isNumber?: boolean }

const config = {
	fields: [
		{ value: "name" },
		{ value: "brand", isOptional: true },
		{ value: "description", isOptional: true },
		{ value: "servingSize", title: "Serving Size", isNumber: true },
		{ value: "servingUnit", title: "Serving Unit" },
		{ value: "calories", isNumber: true },
		{ value: "protein", isNumber: true, isGram: true },
		{ value: "fat", isNumber: true, isGram: true },
		{ value: "carbs", isNumber: true, isGram: true },
		{ value: "fiber", isNumber: true, isGram: true },
		{ value: "sugar", isNumber: true, isGram: true },
	] satisfies Field[],
}

export const FoodForm = (props: { food: Food }) => {
	const updateFood = useMutation(api.foods.update)

	const form = useForm({
		resolver: zodResolver(createFoodSchema),
		defaultValues: {
			image: props.food.image,
			name: props.food.name,
			brand: props.food.brand ?? "",
			description: props.food.description ?? "",
			servingSize: props.food.servingSize,
			servingUnit: props.food.servingUnit,
			calories: props.food.calories,
			protein: props.food.protein,
			fat: props.food.fat,
			carbs: props.food.carbs,
			fiber: props.food.fiber,
			sugar: props.food.sugar,
		},
	})

	const onSubmit = async (input: z.infer<typeof createFoodSchema>) => {
		try {
			await updateFood({ id: props.food._id, ...input })
			toast.success("Saved")
			form.reset(input)
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Something went wrong")
		}
	}

	return (
		<Card>
			<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
				<CardContent className="grid gap-4 p-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Controller
							name="image"
							control={form.control}
							render={({ field }) => <ImagePicker value={field.value as string} onChange={field.onChange} getDefaultQueryOnOpen={() => props.food.name} />}
						/>

						{config.fields.map((field) => (
							<div key={field.value} className="grid gap-1">
								<label htmlFor={field.value} className="text-muted-foreground text-sm">
									{field.title ?? capitalize(field.value)} {field.isOptional ? "(optional)" : ""} {field.isGram ? "(g)" : ""}
								</label>
								<Input {...form.register(field.value, { valueAsNumber: field.isNumber })} />
							</div>
						))}
					</div>
				</CardContent>

				<CardFooter className="justify-end gap-2 p-4 pt-0">
					<Button type="button" variant="outline" onClick={() => form.reset()} disabled={form.formState.isSubmitting}>
						Reset
					</Button>
					<Button type="submit" isLoading={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? "Saving…" : "Save"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
