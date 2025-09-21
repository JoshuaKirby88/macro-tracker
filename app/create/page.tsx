"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { ImagePicker } from "@/components/image-picker"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
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
	defaults: {
		image: "onigiri.png",
		imageQuery: "Onigiri",
	},
}

const Page = () => {
	const router = useRouter()
	const createFood = useMutation(api.foods.create)
	const form = useForm({ resolver: zodResolver(createFoodSchema), defaultValues: { image: config.defaults.image, fiber: 0, sugar: 0 } })
	const name = form.watch("name")

	const onSubmit = async (input: z.infer<typeof createFoodSchema>) => {
		try {
			const newFoodId = await createFood(input)
			toast.success("Food created")
			router.push(`/?newFoodId=${newFoodId}`)
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Something went wrong")
		}
	}

	return (
		<Card className="mx-auto w-[50rem] max-w-[95%]">
			<CardHeader>
				<CardTitle>Create food</CardTitle>
				<CardDescription>Add a custom food with serving and macros.</CardDescription>
			</CardHeader>

			<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
				<CardContent className="grid gap-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Controller
							name="image"
							control={form.control}
							render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} defaultQuery={name ?? config.defaults.imageQuery} />}
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

				<CardFooter className="justify-end gap-2">
					<Button type="submit" isLoading={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? "Creating…" : "Create food"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

export default Page
