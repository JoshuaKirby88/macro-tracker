"use client"

import { useMutation, useQuery } from "convex/react"
import { PlusIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { NumberInput } from "@/components/number-input"
import { Button, buttonVariants } from "@/components/shadcn/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/shadcn/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/utils/convex-types"
import { dateUtil } from "@/utils/date-util"
import { type EntryMealType, entryUtil } from "@/utils/entry-util"

export const FoodAdder = () => {
	const foods = useQuery(api.foods.forUser, {}) ?? []
	const createEntry = useMutation(api.entries.create)

	const [selectedFoodId, setSelectedFoodId] = React.useState<string>("")
	const selectedFood = React.useMemo(() => foods.find((f) => f._id === selectedFoodId), [foods, selectedFoodId])
	const selectedFoodLabel = selectedFood ? `${selectedFood.name}${selectedFood.brand ? ` (${selectedFood.brand})` : ""} — ${selectedFood.servingSize} ${selectedFood.servingUnit}` : ""
	const [quantity, setQuantity] = React.useState(1)
	const [mealType, setMealType] = React.useState<EntryMealType>("breakfast")
	const [submitting, setSubmitting] = React.useState(false)
	const [message, setMessage] = React.useState<string | null>(null)
	const [isCommandOpen, setIsCommandOpen] = React.useState(false)

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setIsCommandOpen((open) => !open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	const onAdd = async () => {
		if (!selectedFoodId || !quantity || quantity <= 0) return
		setSubmitting(true)
		setMessage(null)
		try {
			await createEntry({ foodId: selectedFoodId as Food["_id"], quantity, mealType, date: dateUtil.getDateString(new Date()) })
			setMessage("Added to today's entries")
		} catch (err: any) {
			setMessage(err?.message ?? "Something went wrong")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Card className="fixed bottom-10 left-1/2 -translate-x-1/2 max-w-[95%] w-[30rem]">
			<CardHeader className="hidden items-start justify-between gap-4 sm:flex">
				<CardTitle>Add food</CardTitle>

				<Link href="/create" className={buttonVariants({ variant: "outline", size: "icon" })}>
					<PlusIcon />
				</Link>
			</CardHeader>

			<CardContent className="grid gap-4">
				<div className="grid gap-3">
					<div className="grid gap-1">
						<span className="text-sm text-muted-foreground">Food</span>

						<Button variant="outline" className="w-full text-sm px-3" onClick={() => setIsCommandOpen(true)}>
							{selectedFoodLabel ? (
								<span className="text-left w-full">{selectedFoodLabel}</span>
							) : (
								<span className="flex items-center gap-2 text-muted-foreground w-full">
									<SearchIcon />
									Search foods...
									<kbd className="ml-auto flex items-center rounded border px-1 font-[inherit] text-xs">⌘K</kbd>
								</span>
							)}
						</Button>

						<CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
							<CommandInput placeholder="Type to search foods…" />
							<CommandList>
								<CommandEmpty>No results found.</CommandEmpty>
								<CommandGroup heading="Foods">
									{foods.map((food) => (
										<CommandItem
											key={food._id}
											value={`${food.name} ${food.brand}`}
											onSelect={() => {
												setSelectedFoodId(food._id)
												setIsCommandOpen(false)
											}}
										>
											{food.name}
											{food.brand ? ` (${food.brand})` : ""} — {food.servingSize} {food.servingUnit}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</CommandDialog>
					</div>

					<div className={`grid grid-cols-1 sm:grid-cols-[auto_auto_auto] items-end gap-3 ${!selectedFoodId ? "hidden" : ""}`}>
						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Quantity</span>
							<NumberInput value={quantity} onChange={(value) => setQuantity(value)} />
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Meal</span>
							<Select value={mealType} onValueChange={(v) => setMealType(v as EntryMealType)}>
								<SelectTrigger className="capitalize">
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
						</div>

						<Button onClick={onAdd} disabled={!selectedFoodId || submitting}>
							{submitting ? "Tracking…" : "Track"}
						</Button>
					</div>
				</div>

				{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
			</CardContent>
		</Card>
	)
}
