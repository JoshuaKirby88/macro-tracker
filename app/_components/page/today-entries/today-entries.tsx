"use client"

import { useQuery } from "convex/react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"
import { cn } from "@/utils/cn"
import { useDateString } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { GLOBALS } from "@/utils/globals"
import { EntryDropdown } from "./entry-dropdown"

export const TodayEntries = () => {
	const selectedDate = useDateString("selected")
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: selectedDate })

	if (!entriesWithFoods?.entries.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Today’s entries</CardTitle>
					<CardDescription>Food you have logged today by meal.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground text-sm">No entries yet today.</div>
				</CardContent>
			</Card>
		)
	}

	const mealsWithEntries = entryUtil.mealTypes
		.map((mealType) => ({
			mealType,
			entries: entriesWithFoods.entries.filter((entry) => entry.mealType === mealType),
		}))
		.filter((section) => section.entries.length > 0)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Today’s entries</CardTitle>
			</CardHeader>

			<CardContent className={cn("grid items-start gap-6", mealsWithEntries.length === 1 ? "grid-cols-1" : mealsWithEntries.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
				{mealsWithEntries.map(({ mealType, entries }) => (
					<div key={mealType} className="grid min-w-0 gap-3">
						<div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{mealType}</div>

						<div className="grid items-start gap-2">
							{entries.map((entry) => {
								const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
								if (!food) return null

								return (
									<div key={entry._id} className="flex items-center gap-5 rounded-md border p-3">
										<Image src={GLOBALS.thiings(food.image)} width={50} height={50} alt="Food Image" />

										<div className="min-w-0">
											<div className="truncate font-medium">
												{food.name}
												{food.brand && <span className="ml-1 text-muted-foreground text-sm">({food.brand})</span>}
											</div>
											<div className="text-muted-foreground text-xs">
												{food.servingSize} × {entry.quantity}
											</div>
										</div>

										<div className="ml-auto shrink-0 text-right">
											<div className="font-mono font-semibold text-sm">{Math.round(food.calories * entry.quantity)} kcal</div>
											<div className="text-[10px] text-muted-foreground">
												{Math.round(food.protein * entry.quantity)}g P · {Math.round(food.carbs * entry.quantity)}g C · {Math.round(food.fat * entry.quantity)}g F
											</div>
										</div>

										<EntryDropdown entry={entry} />
									</div>
								)
							})}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	)
}
