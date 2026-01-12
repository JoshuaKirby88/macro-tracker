"use client"

import { useQuery } from "convex/react"
import { EntryItem } from "@/components/entry/entry-item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/shadcn/carousel"
import { api } from "@/convex/_generated/api"
import { cn } from "@/utils/cn"
import { useDateString } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"

const getProgressColor = (percentage: number): string => {
	if (percentage < 90) return "bg-primary/80"
	if (percentage <= 110) return "bg-green-500"
	if (percentage <= 120) return "bg-yellow-500"
	return "bg-orange-500"
}

const MiniMacro = ({ label, value, goal, unit }: { label: string; value: number; goal?: number; unit?: string }) => {
	const percent = goal ? Math.min((value / goal) * 100, 100) : 0

	return (
		<div className="flex min-w-[3.5rem] flex-col">
			<div className="mb-1.5 flex items-end justify-between text-[10px] leading-none">
				<span className="font-semibold text-muted-foreground uppercase">{label}</span>
				<span className={cn("font-medium font-mono", goal && value > goal ? "text-orange-500" : "text-foreground")}>
					{Math.round(value)}
					{unit}
				</span>
			</div>
			{goal && (
				<div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
					<div className={cn("h-full rounded-full transition-all", getProgressColor(percent))} style={{ width: `${percent}%` }} />
				</div>
			)}
		</div>
	)
}

export const TodayEntries = () => {
	const selectedDate = useDateString("selected")
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: selectedDate })
	const goal = useQuery(api.goals.forDate, { date: selectedDate })

	if (!entriesWithFoods?.entries.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Today's entries</CardTitle>
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

	const totals = entryUtil.getTotals(entriesWithFoods)

	const dailyGoals = goal
		? {
				calories: (goal.breakfast?.calories ?? 0) + (goal.lunch?.calories ?? 0) + (goal.dinner?.calories ?? 0) || undefined,
				protein: (goal.breakfast?.protein ?? 0) + (goal.lunch?.protein ?? 0) + (goal.dinner?.protein ?? 0) || undefined,
				fat: (goal.breakfast?.fat ?? 0) + (goal.lunch?.fat ?? 0) + (goal.dinner?.fat ?? 0) || undefined,
				carbs: (goal.breakfast?.carbs ?? 0) + (goal.lunch?.carbs ?? 0) + (goal.dinner?.carbs ?? 0) || undefined,
				fiber: (goal.breakfast?.fiber ?? 0) + (goal.lunch?.fiber ?? 0) + (goal.dinner?.fiber ?? 0) || undefined,
			}
		: { calories: undefined, protein: undefined, fat: undefined, carbs: undefined, fiber: undefined }

	return (
		<Carousel opts={{ duration: 20, startIndex: entryUtil.mealTypes.indexOf(entryUtil.getMealType(new Date())) }}>
			<Card className="border-0 shadow-none sm:border sm:shadow-sm">
				<CardContent className="p-0 sm:p-6">
					<div className="mb-4 flex flex-col gap-4 px-4 pt-4 sm:px-0 sm:pt-0">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Today's entries</CardTitle>
								<div className="flex gap-1 lg:hidden">
									<CarouselPrevious className="static h-8 w-8 translate-y-0" />
									<CarouselNext className="static h-8 w-8 translate-y-0" />
								</div>
							</div>

							{/* Ultra Compact Summary */}
							<div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg bg-secondary/10 p-3 text-sm sm:bg-transparent sm:p-0">
								{/* Main Calories */}
								<div className="flex min-w-[6rem] flex-col">
									<div className="mb-1.5 flex items-baseline justify-between">
										<span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Calories</span>
										<span className="font-bold font-mono text-sm">
											{Math.round(totals.calories)}
											{dailyGoals.calories && <span className="ml-1 font-normal text-[10px] text-muted-foreground">/ {Math.round(dailyGoals.calories)}</span>}
										</span>
									</div>
									{dailyGoals.calories && (
										<div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
											<div
												className={cn("h-full rounded-full transition-all", getProgressColor((totals.calories / dailyGoals.calories) * 100))}
												style={{ width: `${Math.min((totals.calories / dailyGoals.calories) * 100, 100)}%` }}
											/>
										</div>
									)}
								</div>

								{/* Divider for desktop */}
								<div className="hidden h-8 w-px bg-border/50 sm:block" />

								{/* Macros Row */}
								<div className="hide-scrollbar flex flex-1 items-center gap-4 overflow-x-auto pb-1 sm:flex-none sm:pb-0">
									<MiniMacro label="Protein" value={totals.protein} goal={dailyGoals.protein} unit="g" />
									<MiniMacro label="Carbs" value={totals.carbs} goal={dailyGoals.carbs} unit="g" />
									<MiniMacro label="Fat" value={totals.fat} goal={dailyGoals.fat} unit="g" />
									<MiniMacro label="Fiber" value={totals.fiber} goal={dailyGoals.fiber} unit="g" />
								</div>
							</div>
						</div>
					</div>

					<CarouselContent className="-ml-4 px-4 sm:px-0">
						{mealsWithEntries.map(({ mealType, entries }) => {
							const mealTotals = entries.reduce(
								(acc, entry) => {
									const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
									if (!food) return acc
									const qty = entry.quantity
									acc.calories += food.calories * qty
									acc.protein += food.protein * qty
									acc.carbs += food.carbs * qty
									acc.fat += food.fat * qty
									acc.fiber += (food.fiber || 0) * qty
									return acc
								},
								{ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
							)

							const mealGoal = goal?.[mealType]

							return (
								<CarouselItem key={mealType} className="pl-4 sm:basis-1/2 lg:basis-1/3">
									<div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm">
										<div className="flex flex-col gap-2 border-b bg-muted/30 px-3 py-2">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-sm capitalize">{mealType}</span>
												<div className="flex items-baseline gap-1">
													<span className="font-medium font-mono text-xs">{Math.round(mealTotals.calories)}</span>
													{mealGoal?.calories && <span className="font-mono text-[10px] text-muted-foreground">/ {Math.round(mealGoal.calories)}</span>}
													<span className="ml-0.5 font-mono text-[10px] text-muted-foreground">cal</span>
												</div>
											</div>
											<div className="flex items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
												<div className="flex gap-0.5">
													<span className={cn(mealGoal?.protein && mealTotals.protein < mealGoal.protein ? "text-orange-500" : "")}>{Math.round(mealTotals.protein)}</span>
													{mealGoal?.protein && <span className="opacity-50">/{Math.round(mealGoal.protein)}</span>}
													<span>P</span>
												</div>
												<span className="text-border">•</span>
												<div className="flex gap-0.5">
													<span className={cn(mealGoal?.carbs && mealTotals.carbs > mealGoal.carbs ? "text-orange-500" : "")}>{Math.round(mealTotals.carbs)}</span>
													{mealGoal?.carbs && <span className="opacity-50">/{Math.round(mealGoal.carbs)}</span>}
													<span>C</span>
												</div>
												<span className="text-border">•</span>
												<div className="flex gap-0.5">
													<span className={cn(mealGoal?.fat && mealTotals.fat > mealGoal.fat ? "text-orange-500" : "")}>{Math.round(mealTotals.fat)}</span>
													{mealGoal?.fat && <span className="opacity-50">/{Math.round(mealGoal.fat)}</span>}
													<span>F</span>
												</div>
												<span className="text-border">•</span>
												<div className="flex gap-0.5">
													<span className={cn(mealGoal?.fiber && mealTotals.fiber < mealGoal.fiber ? "text-orange-500" : "")}>{Math.round(mealTotals.fiber)}</span>
													{mealGoal?.fiber && <span className="opacity-50">/{Math.round(mealGoal.fiber)}</span>}
													<span>Fi</span>
												</div>
											</div>
										</div>

										<div className="space-y-2 p-2">
											{entries.map((entry) => {
												const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
												if (!food) return null
												return <EntryItem key={entry._id} entry={entry} food={food} dropdownItems={{ edit: true, delete: true, viewFood: true }} hideMealType />
											})}
										</div>
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
