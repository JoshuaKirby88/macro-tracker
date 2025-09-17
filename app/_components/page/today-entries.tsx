"use client"

import { useQuery } from "convex/react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"

export const TodayEntries = () => {
	const today = dateUtil.getDateString(new Date())
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: today })
	if (!entriesWithFoods) return null

	if (!entriesWithFoods.entries.length) {
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

	return (
		<Card>
			<CardHeader>
				<CardTitle>Today’s entries</CardTitle>
				<CardDescription>Food you have logged today by meal.</CardDescription>
			</CardHeader>

			<CardContent className="grid gap-6">
				{entryUtil.mealTypes.map((mealType) => {
					const entries = entriesWithFoods.entries.filter((e) => e.mealType === mealType)

					return (
						entries.length > 0 && (
							<div key={mealType} className="grid gap-3">
								<div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{mealType}</div>

								<div className="grid gap-2">
									{entries.map((entry) => {
										const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
										if (!food) return null

										return (
											<div key={entry._id} className="flex items-center gap-5 rounded-md border p-3">
												<Image src={`https://thiings.joshuakirby.webcam/${food.image}`} width={50} height={50} alt="Food Image" />
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
											</div>
										)
									})}
								</div>
							</div>
						)
					)
				})}
			</CardContent>
		</Card>
	)
}
