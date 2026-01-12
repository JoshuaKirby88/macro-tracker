"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
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
import { UpdateEntriesQuantityFormDialog } from "./update-entries-quantity-form-dialog"

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
	const searchParams = useSearchParams()
	const createFood = useMutation(api.foods.create)
	const updateFood = useMutation(api.foods.update)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [servingSizeDelta, setServingSizeDelta] = useState<{ prev: number; next: number } | null>(null)

	const schema = props.type === "create" ? config.createFoodSchema : updateFoodSchema

	const getPrefilledDefaults = () => {
		if (props.type === "update") return props.food
		if (!searchParams) return { image: config.defaults.image }

		const getParam = (key: string): string | undefined => searchParams.get(key) ?? undefined

		return {
			name: getParam("name"),
			brand: getParam("brand"),
			description: getParam("description"),
			servingSize: getParam("servingSize") ? Number(getParam("servingSize")) : undefined,
			servingUnit: getParam("servingUnit") || config.defaults.servingUnit,
			calories: getParam("calories") ? Number(getParam("calories")) : undefined,
			protein: getParam("protein") ? Number(getParam("protein")) : undefined,
			fat: getParam("fat") ? Number(getParam("fat")) : undefined,
			carbs: getParam("carbs") ? Number(getParam("carbs")) : undefined,
			fiber: getParam("fiber") ? Number(getParam("fiber")) : undefined,
			sugar: getParam("sugar") ? Number(getParam("sugar")) : undefined,
			image: config.defaults.image,
		}
	}

	const form = useForm({ resolver: zodResolver(schema), defaultValues: getPrefilledDefaults() })

	useEffect(() => {
		if (props.type === "create" && searchParams) {
			const getParam = (key: string): string | undefined => searchParams.get(key) ?? undefined

			const name = getParam("name")
			if (name) form.setValue("name", name)
			const brand = getParam("brand")
			if (brand) form.setValue("brand", brand)
			const description = getParam("description")
			if (description) form.setValue("description", description)
			const servingSize = getParam("servingSize")
			if (servingSize) form.setValue("servingSize", Number(servingSize))
			const servingUnit = getParam("servingUnit")
			if (servingUnit) form.setValue("servingUnit", servingUnit)
			const calories = getParam("calories")
			if (calories) form.setValue("calories", Number(calories))
			const protein = getParam("protein")
			if (protein) form.setValue("protein", Number(protein))
			const fat = getParam("fat")
			if (fat) form.setValue("fat", Number(fat))
			const carbs = getParam("carbs")
			if (carbs) form.setValue("carbs", Number(carbs))
			const fiber = getParam("fiber")
			if (fiber) form.setValue("fiber", Number(fiber))
			const sugar = getParam("sugar")
			if (sugar) form.setValue("sugar", Number(sugar))
		}
	}, [searchParams, props.type, form.setValue])

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

				if (typeof input.servingSize === "number" && input.servingSize !== props.food.servingSize) {
					setServingSizeDelta({ prev: props.food.servingSize, next: input.servingSize })
					setIsDialogOpen(true)
				}
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

			{props.type === "update" && <UpdateEntriesQuantityFormDialog food={props.food} isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} servingSizeDelta={servingSizeDelta} />}
		</FoodFormUploadImage>
	)
}
