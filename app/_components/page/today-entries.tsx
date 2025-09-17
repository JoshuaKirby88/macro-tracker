"use client"

import { useQuery } from "convex/react"
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
					<div className="text-sm text-muted-foreground">No entries yet today.</div>
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
								<div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{mealType}</div>

								<div className="grid gap-2">
									{entries.map((entry) => {
										const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)!

										return (
											<div key={entry._id} className="flex items-start justify-between rounded-md border p-3">
												<div className="min-w-0">
													<div className="truncate font-medium">
														{food.name}
														{food.brand && <span className="text-sm ml-1 text-muted-foreground">({food.brand})</span>}
													</div>
													<div className="text-xs text-muted-foreground">
														{food.servingSize} × {entry.quantity}
													</div>
												</div>
												<div className="shrink-0 text-right">
													<div className="font-mono text-sm font-semibold">{Math.round(food.calories * entry.quantity)} kcal</div>
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
