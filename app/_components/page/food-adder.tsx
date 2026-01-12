"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { PenIcon, PlusIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { FoodCommand } from "@/components/food/food-command"
import { FormNumberInput } from "@/components/form-number-input"
import { Button, buttonVariants } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import { createEntrySchema, type Food } from "@/convex/schema"
import { useDateString } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	schema: createEntrySchema.omit({ entryDate: true }),
}

export const FoodAdder = () => {
	const searchParams = useSearchParams()
	const selectedDate = useDateString("selected")
	const createEntry = useMutation(api.entries.create)
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: selectedDate })
	const foods = useQuery(api.foods.forUser)

	const form = useForm({ resolver: zodResolver(config.schema), defaultValues: { mealType: entryUtil.getMealType(new Date()), actualQuantity: 0 } })
	const selectedFoodId = form.watch("foodId")

	const selectedFood = foods?.find((f) => f._id === selectedFoodId)

	useEffect(() => {
		if (selectedFood) {
			form.setValue("actualQuantity", selectedFood.servingSize)
		}
	}, [selectedFood, form.setValue])

	useEffect(() => {
		const newFoodId = searchParams?.get("newFoodId")
		if (newFoodId && !form.getValues("foodId")) {
			form.setValue("foodId", newFoodId as Food["_id"])
			if (typeof window !== "undefined") {
				window.history.replaceState(null, "", window.location.pathname)
			}
		}
	}, [searchParams, form.getValues, form.setValue])

	useEffect(() => {
		if (!entriesWithFoods?.entries?.length) return
		const latest = entriesWithFoods.entries.reduce((acc, e) => (e.createdAt > acc.createdAt ? e : acc), entriesWithFoods.entries[0])
		const timeDefault = entryUtil.getMealType(new Date())
		const currentMeal = form.getValues("mealType")
		if (currentMeal === timeDefault) {
			form.setValue("mealType", latest.mealType)
		}
	}, [entriesWithFoods, form.getValues, form.setValue])

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			await createEntry({ ...input, entryDate: selectedDate })
			toast.success("Added to today's entries")
			form.reset()
		} catch (error: any) {
			toast.error(error?.message ?? "Something went wrong")
		}
	}

	return (
		<Card className="-translate-x-1/2 fixed bottom-3 left-1/2 w-[30rem] max-w-[95%] flex-row p-4 shadow-2xl">
			<form onSubmit={form.handleSubmit(onSubmit, toastFormError)} className="grid w-full gap-3">
				<div className="flex min-w-0 gap-2">
					<div className="min-w-0 grow">
						<Controller
							name="foodId"
							control={form.control}
							render={({ field }) => <FoodCommand foodId={field.value} onChange={(val) => field.onChange(val)} onSelect={() => setTimeout(() => form.setFocus("actualQuantity"), 0)} />}
						/>
					</div>

					<div className="flex gap-2">
						<Link href="/search" className={buttonVariants({ variant: "outline", size: "icon" })}>
							<SearchIcon />
						</Link>

						<Link href="/foods" className={buttonVariants({ variant: "outline", size: "icon" })}>
							<PenIcon />
						</Link>

						<Link href="/create" className={buttonVariants({ variant: "outline", size: "icon" })}>
							<PlusIcon />
						</Link>
					</div>
				</div>

				<div className={`grid grid-cols-3 items-end gap-2 ${!selectedFoodId ? "hidden" : ""}`}>
					<div className="grid gap-1">
						<span className="text-muted-foreground text-sm">{selectedFood ? `Quantity (${selectedFood.servingUnit})` : "Quantity"}</span>
						<FormNumberInput form={form} value="actualQuantity" />
					</div>

					<div className="grid gap-1">
						<span className="text-muted-foreground text-sm">Meal</span>
						<Controller
							control={form.control}
							name="mealType"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="w-full capitalize">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{entryUtil.mealTypes.map((mealType) => (
											<SelectItem key={mealType} value={mealType} className="capitalize">
												{mealType}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>

					<Button type="submit" isLoading={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? "Tracking…" : "Track"}
					</Button>
				</div>
			</form>
		</Card>
	)
}
