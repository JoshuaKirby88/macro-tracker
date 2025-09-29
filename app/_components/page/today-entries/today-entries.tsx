"use client"

import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/shadcn/carousel"
import { api } from "@/convex/_generated/api"
import { useDateString } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { EntryItem } from "./entry-item"

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
		<Carousel opts={{ duration: 20 }}>
			<Card className="px-3 md:px-4 lg:px-6">
				<CardHeader className="flex h-8 flex-row justify-between px-0">
					<CardTitle>Today’s entries</CardTitle>

					<div className="flex gap-2 lg:hidden">
						<CarouselPrevious className="translate-0 static" />
						<CarouselNext className="translate-0 static" />
					</div>
				</CardHeader>

				<CardContent className="px-0">
					<CarouselContent>
						{mealsWithEntries.map(({ mealType, entries }) => {
							const totals = entries.reduce(
								(acc, entry) => {
									const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
									if (!food) return acc
									const qty = entry.quantity
									acc.calories += food.calories * qty
									acc.protein += food.protein * qty
									acc.carbs += food.carbs * qty
									acc.fat += food.fat * qty
									return acc
								},
								{ calories: 0, protein: 0, carbs: 0, fat: 0 },
							)

							return (
								<CarouselItem key={mealType} className="space-y-3 lg:basis-1/3">
									<div className="flex items-baseline justify-between">
										<div className="font-bold text-xs capitalize">{mealType}</div>
										<div className="font-mono text-muted-foreground text-xs">
											<span className="text-foreground">{Math.round(totals.calories)} Cal</span> · {Math.round(totals.protein)}g P · {Math.round(totals.carbs)}g C ·{" "}
											{Math.round(totals.fat)}g F
										</div>
									</div>

									<div className="space-y-2">
										{entries.map((entry) => {
											const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
											if (!food) return null

											return <EntryItem key={entry._id} entry={entry} food={food} />
										})}
									</div>
								</CarouselItem>
							)
						})}
					</CarouselContent>
				</CardContent>
			</Card>
		</Carousel>
	)
}
