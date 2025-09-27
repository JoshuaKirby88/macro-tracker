"use client"

import { useQuery } from "convex/react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/shadcn/carousel"
import { api } from "@/convex/_generated/api"
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
		<Carousel opts={{ duration: 20 }}>
			<Card>
				<CardHeader className="flex h-8 flex-row justify-between">
					<CardTitle>Today’s entries</CardTitle>

					<div className="flex gap-2 lg:hidden">
						<CarouselPrevious className="translate-0 static" />
						<CarouselNext className="translate-0 static" />
					</div>
				</CardHeader>

				<CardContent>
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
														<div className="font-mono font-semibold text-sm">{Math.round(food.calories * entry.quantity)} Cal</div>
														<div className="text-[10px] text-muted-foreground">
															{Math.round(food.protein * entry.quantity)}g P · {Math.round(food.carbs * entry.quantity)}g C · {Math.round(food.fat * entry.quantity)}g F
														</div>
													</div>

													<EntryDropdown entry={entry} />
												</div>
											)
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
