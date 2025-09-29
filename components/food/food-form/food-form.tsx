"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { FormNumberInput } from "@/components/form-number-input"
import { ImagePicker } from "@/components/image-picker"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { createFoodSchema, type Food, updateFoodSchema } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"
import { toastFormError } from "@/utils/form/toast-form-error"
import { FoodFormMultiplier } from "./food-form-multiplier"
import { FoodFormUploadImage, FoodFormUploadImageButton } from "./food-form-upload-image"

export type FoodFormField = { value: keyof Food; title?: string; isGram?: boolean; isNumber?: boolean }

const config = {
	fields: [
		{ value: "name" },
		{ value: "brand" },
		{ value: "description" },
		{ value: "servingSize", title: "Serving Size", isNumber: true },
		{ value: "servingUnit", title: "Serving Unit" },
		{ value: "calories", isNumber: true },
		{ value: "protein", isNumber: true, isGram: true },
		{ value: "fat", isNumber: true, isGram: true },
		{ value: "carbs", isNumber: true, isGram: true },
		{ value: "fiber", isNumber: true, isGram: true },
		{ value: "sugar", isNumber: true, isGram: true },
	] satisfies FoodFormField[],
	defaults: {
		image: "onigiri",
		servingUnit: "servings",
		imageQuery: "Onigiri",
	},
	createFoodSchema: createFoodSchema.partial().required({ name: true, image: true }),
}

export const FoodForm = (props: { type: "create" } | { type: "update"; food: Food }) => {
	const router = useRouter()
	const createFood = useMutation(api.foods.create)
	const updateFood = useMutation(api.foods.update)

	const schema = props.type === "create" ? config.createFoodSchema : updateFoodSchema
	const form = useForm({ resolver: zodResolver(schema), defaultValues: props.type === "create" ? { image: config.defaults.image } : props.food })

	const onSubmit = async (inputUnion: z.infer<typeof schema>) => {
		try {
			if (props.type === "create") {
				const input = config.createFoodSchema.parse(inputUnion)
				const newFoodId = await createFood({
					name: input.name,
					image: input.image,
					brand: input.brand,
					description: input.description,
					servingSize: input.servingSize ?? 1,
					servingUnit: input.servingUnit || config.defaults.servingUnit,
					calories: input.calories ?? 0,
					protein: input.protein ?? 0,
					fat: input.fat ?? 0,
					carbs: input.carbs ?? 0,
					sugar: input.sugar ?? 0,
					fiber: input.fiber ?? 0,
				})
				toast.success("Food created")
				router.push(`/?newFoodId=${newFoodId}`)
			} else if (props.type === "update") {
				const input = updateFoodSchema.parse(inputUnion)
				await updateFood({ id: props.food._id, ...input })
				toast.success("Saved")
				form.reset(input)
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Something went wrong")
		}
	}

	return (
		<FoodFormUploadImage form={form}>
			<Card className="mx-auto w-[50rem] max-w-[95%]">
				<CardHeader className="flex flex-row justify-end">
					<FoodFormUploadImageButton />
				</CardHeader>

				<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
					<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Controller
							name="image"
							control={form.control}
							render={({ field }) => (
								<ImagePicker value={field.value as string} onChange={field.onChange} getDefaultQueryOnOpen={() => form.getValues("name") ?? config.defaults.imageQuery} />
							)}
						/>

						{config.fields.map((field) => (
							<div key={field.value} className="grid gap-1">
								<label htmlFor={field.value} className="text-muted-foreground text-sm">
									{field.title ?? capitalize(field.value)} {field.isGram ? "(g)" : ""}
								</label>

								{field.isNumber ? <FormNumberInput form={form} value={field.value} /> : <Input {...form.register(field.value)} />}
							</div>
						))}
					</CardContent>

					<CardFooter className="mt-8 justify-between gap-2">
						<FoodFormMultiplier form={form} fields={config.fields} />

						<div className="flex gap-2">
							<Button variant="outline" onClick={() => form.reset()} disabled={form.formState.isSubmitting}>
								Reset
							</Button>

							<Button type="submit" isLoading={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving…" : "Save"}
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</FoodFormUploadImage>
	)
}
