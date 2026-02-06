"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { PenIcon, PlusIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { FoodCommand } from "@/components/food/food-command"
import { type PublicFood, PublicFoodSearch } from "@/components/food/public-food-search"
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

const everydayActionShortcuts = {
	publicSearch: "u",
	manageFoods: "f",
	createFood: "n",
} as const

const shortcutLabel = (key: string) => `Ctrl+X ${key.toUpperCase()}`

const isEditableElement = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false
	const tag = target.tagName
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable
}

const KeyBadge = ({ label }: { label: string }) => (
	<kbd
		aria-hidden="true"
		className="-bottom-1.5 -right-1.5 pointer-events-none absolute min-w-5 rounded border border-border bg-background/95 px-1 font-semibold text-[10px] text-muted-foreground uppercase shadow-sm dark:bg-background/75"
	>
		{label.toUpperCase()}
	</kbd>
)

export const FoodAdder = () => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const selectedDate = useDateString("selected")
	const createEntry = useMutation(api.entries.create)
	const createFood = useMutation(api.foods.create)
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: selectedDate })
	const foods = useQuery(api.foods.forUser)
	const [isPublicSearchOpen, setIsPublicSearchOpen] = React.useState(false)
	const leaderActiveRef = useRef(false)
	const leaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			await createEntry({ ...input, entryDate: selectedDate })
			toast.success("Added to today's entries")
			form.reset()
		} catch (error: any) {
			toast.error(error?.message ?? "Something went wrong")
		}
	}

	const everydayActions = useMemo(
		() => [
			{ key: everydayActionShortcuts.publicSearch, action: () => setIsPublicSearchOpen(true) },
			{ key: everydayActionShortcuts.manageFoods, action: () => router.push("/foods") },
			{ key: everydayActionShortcuts.createFood, action: () => router.push("/create") },
		],
		[router],
	)

	useEffect(() => {
		const actionMap = new Map(everydayActions.map((entry) => [entry.key, entry.action]))
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isEditableElement(event.target)) return

			if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "x") {
				leaderActiveRef.current = true
				if (leaderTimeoutRef.current) clearTimeout(leaderTimeoutRef.current)
				leaderTimeoutRef.current = setTimeout(() => {
					leaderActiveRef.current = false
				}, 1500)
				event.preventDefault()
				return
			}

			if (!leaderActiveRef.current) return

			const action = actionMap.get(event.key.toLowerCase())
			if (action) {
				action()
				if (leaderTimeoutRef.current) clearTimeout(leaderTimeoutRef.current)
				leaderActiveRef.current = false
				event.preventDefault()
			}
		}

		window.addEventListener("keydown", handleKeyDown)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			if (leaderTimeoutRef.current) clearTimeout(leaderTimeoutRef.current)
			leaderActiveRef.current = false
		}
	}, [everydayActions])

	return (
		<>
			<Card className="-translate-x-1/2 fixed bottom-3 left-1/2 w-[30rem] max-w-[95%] flex-row p-4 shadow-2xl">
				<form onSubmit={form.handleSubmit(onSubmit, toastFormError)} className="grid w-full gap-3">
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
								title={`Search USDA (${shortcutLabel(everydayActionShortcuts.publicSearch)})`}
								aria-label={`Search USDA (${shortcutLabel(everydayActionShortcuts.publicSearch)})`}
								className="relative"
							>
								<SearchIcon />
								<KeyBadge label={everydayActionShortcuts.publicSearch} />
							</Button>

							<Link
								href="/foods"
								className={`${buttonVariants({ variant: "outline", size: "icon" })} relative`}
								title={`Manage foods (${shortcutLabel(everydayActionShortcuts.manageFoods)})`}
								aria-label={`Manage foods (${shortcutLabel(everydayActionShortcuts.manageFoods)})`}
							>
								<PenIcon />
								<KeyBadge label={everydayActionShortcuts.manageFoods} />
							</Link>

							<Link
								href="/create"
								className={`${buttonVariants({ variant: "outline", size: "icon" })} relative`}
								title={`Create food (${shortcutLabel(everydayActionShortcuts.createFood)})`}
								aria-label={`Create food (${shortcutLabel(everydayActionShortcuts.createFood)})`}
							>
								<PlusIcon />
								<KeyBadge label={everydayActionShortcuts.createFood} />
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

			<PublicFoodSearch open={isPublicSearchOpen} onOpenChange={setIsPublicSearchOpen} onSelect={handlePublicFoodSelect} />
		</>
	)
}
