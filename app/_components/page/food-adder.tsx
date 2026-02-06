"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { PenIcon, PlusIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useCallback, useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { FoodCommand } from "@/components/food/food-command"
import { type PublicFood, PublicFoodSearch } from "@/components/food/public-food-search"
import { FormNumberInput } from "@/components/form-number-input"
import { KeyBadge } from "@/components/key-badge"
import { Button, buttonVariants } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import { createEntrySchema, type Food } from "@/convex/schema"
import { useDateString } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"
import { getShortcutLabel, useLeaderShortcut } from "@/utils/shortcuts"

const config = {
	schema: createEntrySchema.omit({ entryDate: true }),
}

const everydayActionShortcuts = {
	publicSearch: "u",
	manageFoods: "f",
	createFood: "n",
} as const

const mealShortcutKeys = {
	breakfast: "b",
	lunch: "l",
	dinner: "d",
} as const

export const FoodAdder = () => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const selectedDate = useDateString("selected")
	const createEntry = useMutation(api.entries.create)
	const createFood = useMutation(api.foods.create)
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: selectedDate })
	const foods = useQuery(api.foods.forUser)
	const [isPublicSearchOpen, setIsPublicSearchOpen] = React.useState(false)

	const form = useForm({ resolver: zodResolver(config.schema), defaultValues: { mealType: entryUtil.getMealType(new Date()), actualQuantity: 0 } })
	const selectedFoodId = form.watch("foodId")

	const selectedFood = foods?.find((f) => f._id === selectedFoodId)
	const handlePublicFoodSelect = async (publicFood: PublicFood) => {
		try {
			const newFoodId = await createFood({
				name: publicFood.name,
				image: "onigiri",
				brand: publicFood.brand,
				description: publicFood.description,
				servingSize: publicFood.servingSize ?? 1,
				servingUnit: publicFood.servingUnit ?? "servings",
				calories: publicFood.calories ?? 0,
				protein: publicFood.protein ?? 0,
				fat: publicFood.fat ?? 0,
				carbs: publicFood.carbs ?? 0,
				sugar: publicFood.sugar ?? 0,
				fiber: publicFood.fiber ?? 0,
			})
			form.setValue("foodId", newFoodId)
			toast.success(`Imported "${publicFood.name}"`)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to import food")
		}
	}

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

	const handleValidSubmit = useCallback(
		async (input: z.infer<typeof config.schema>) => {
			try {
				await createEntry({ ...input, entryDate: selectedDate })
				toast.success("Added to today's entries")
				form.reset()
			} catch (error: any) {
				toast.error(error?.message ?? "Something went wrong")
			}
		},
		[createEntry, selectedDate, form],
	)

	const submitCurrentForm = useCallback(() => {
		void form.handleSubmit(handleValidSubmit, toastFormError)()
	}, [form, handleValidSubmit])

	const focusQuantity = useCallback(() => form.setFocus("actualQuantity"), [form])

	const mealShortcuts = useMemo(
		() =>
			entryUtil.mealTypes.map((mealType) => ({
				key: mealShortcutKeys[mealType as keyof typeof mealShortcutKeys],
				handler: () => form.setValue("mealType", mealType),
			})),
		[form],
	)

	useLeaderShortcut([
		{ key: everydayActionShortcuts.publicSearch, handler: () => setIsPublicSearchOpen(true) },
		{ key: everydayActionShortcuts.manageFoods, handler: () => router.push("/foods") },
		{ key: everydayActionShortcuts.createFood, handler: () => router.push("/create") },
		{ key: "q", handler: focusQuantity, enabled: Boolean(selectedFoodId) },
		{ key: "r", handler: submitCurrentForm, enabled: Boolean(selectedFoodId) },
		...mealShortcuts,
	])

	return (
		<>
			<Card className="-translate-x-1/2 fixed bottom-3 left-1/2 w-[30rem] max-w-[95%] flex-row p-4 shadow-2xl">
				<form onSubmit={form.handleSubmit(handleValidSubmit, toastFormError)} className="grid w-full gap-3">
					<div className="flex min-w-0 gap-2">
						<div className="min-w-0 grow">
							<Controller
								name="foodId"
								control={form.control}
								render={({ field }) => (
									<FoodCommand foodId={field.value} onChange={(val) => field.onChange(val)} onSelect={() => setTimeout(() => form.setFocus("actualQuantity"), 0)} />
								)}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setIsPublicSearchOpen(true)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault()
										setIsPublicSearchOpen(true)
									}
								}}
								title={`Search USDA (${getShortcutLabel(everydayActionShortcuts.publicSearch)})`}
								aria-label={`Search USDA (${getShortcutLabel(everydayActionShortcuts.publicSearch)})`}
								className="relative"
							>
								<SearchIcon />
								<KeyBadge label={everydayActionShortcuts.publicSearch} />
							</Button>

							<Link
								href="/foods"
								className={`${buttonVariants({ variant: "outline", size: "icon" })} relative`}
								title={`Manage foods (${getShortcutLabel(everydayActionShortcuts.manageFoods)})`}
								aria-label={`Manage foods (${getShortcutLabel(everydayActionShortcuts.manageFoods)})`}
							>
								<PenIcon />
								<KeyBadge label={everydayActionShortcuts.manageFoods} />
							</Link>

							<Link
								href="/create"
								className={`${buttonVariants({ variant: "outline", size: "icon" })} relative`}
								title={`Create food (${getShortcutLabel(everydayActionShortcuts.createFood)})`}
								aria-label={`Create food (${getShortcutLabel(everydayActionShortcuts.createFood)})`}
							>
								<PlusIcon />
								<KeyBadge label={everydayActionShortcuts.createFood} />
							</Link>
						</div>
					</div>

					<div className={`grid grid-cols-3 items-end gap-2 ${!selectedFoodId ? "hidden" : ""}`}>
						<div className="grid gap-1">
							<span className="text-muted-foreground text-sm">{selectedFood ? `Quantity (${selectedFood.servingUnit})` : "Quantity"}</span>
							<div className="relative">
								<FormNumberInput form={form} value="actualQuantity" />
								<KeyBadge label="q" />
							</div>
						</div>

						<div className="grid gap-1">
							<span className="text-muted-foreground text-sm">Meal</span>
							<Controller
								control={form.control}
								name="mealType"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="relative w-full capitalize">
											<SelectValue />
											<KeyBadge label={mealShortcutKeys[field.value as keyof typeof mealShortcutKeys] ?? "b"} />
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

						<Button type="submit" isLoading={form.formState.isSubmitting} className="relative">
							{form.formState.isSubmitting ? "Tracking…" : "Track"}
							<KeyBadge label="r" />
						</Button>
					</div>
				</form>
			</Card>

			<PublicFoodSearch open={isPublicSearchOpen} onOpenChange={setIsPublicSearchOpen} onSelect={handlePublicFoodSelect} />
		</>
	)
}
