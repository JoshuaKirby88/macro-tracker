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
	// Below goal is bad (not meeting target)
	if (percentage < 90) return "bg-red-500"
	// Close to goal (90-110%) is good (hitting target)
	if (percentage <= 110) return "bg-green-500"
	// Slightly over goal (110-120%) is okay but getting high
	if (percentage <= 120) return "bg-yellow-500"
	// Way over goal is concerning
	return "bg-orange-500"
}

const MacroWithProgress = ({
	value,
	goalValue,
	unit,
	className,
	compact = false,
}: {
	value: number
	goalValue: number | undefined
	unit: string
	className?: string
	compact?: boolean
}) => {
	const rounded = Math.round(value)
	const roundedGoal = goalValue ? Math.round(goalValue) : undefined
	const percentage = goalValue ? (value / goalValue) * 100 : undefined

	return (
		<span className={cn("inline-flex items-center gap-1", className)}>
			{goalValue !== undefined ? (
				<span>{rounded}/{roundedGoal}{unit}</span>
			) : (
				<span>{rounded}{unit}</span>
			)}
			{percentage !== undefined && (
				<span className="relative inline-flex items-center">
					<span
						className={cn(
							"rounded-full overflow-hidden bg-muted",
							compact ? "h-1 w-6" : "h-1.5 w-8",
						)}
						title={`${Math.round(percentage)}% of goal`}
					>
						<span
							className={cn(
								"h-full block rounded-full transition-all",
								getProgressColor(percentage),
							)}
							style={{ width: `${Math.min(percentage, 100)}%` }}
						/>
					</span>
				</span>
			)}
		</span>
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

	// Calculate daily goals by summing all meal goals
	const dailyGoals = goal
		? {
				calories: (() => {
					const sum =
						(goal.breakfast?.calories ?? 0) + (goal.lunch?.calories ?? 0) + (goal.dinner?.calories ?? 0)
					return sum > 0 ? sum : undefined
				})(),
				protein: (() => {
					const sum =
						(goal.breakfast?.protein ?? 0) + (goal.lunch?.protein ?? 0) + (goal.dinner?.protein ?? 0)
					return sum > 0 ? sum : undefined
				})(),
				fat: (() => {
					const sum = (goal.breakfast?.fat ?? 0) + (goal.lunch?.fat ?? 0) + (goal.dinner?.fat ?? 0)
					return sum > 0 ? sum : undefined
				})(),
				carbs: (() => {
					const sum =
						(goal.breakfast?.carbs ?? 0) + (goal.lunch?.carbs ?? 0) + (goal.dinner?.carbs ?? 0)
					return sum > 0 ? sum : undefined
				})(),
				fiber: (() => {
					const sum =
						(goal.breakfast?.fiber ?? 0) + (goal.lunch?.fiber ?? 0) + (goal.dinner?.fiber ?? 0)
					return sum > 0 ? sum : undefined
				})(),
			}
		: { calories: undefined, protein: undefined, fat: undefined, carbs: undefined, fiber: undefined }

	return (
		<Carousel opts={{ duration: 20, startIndex: entryUtil.mealTypes.indexOf(entryUtil.getMealType(new Date())) }}>
			<Card className="px-3 md:px-4 lg:px-6">
				<CardHeader className="flex h-8 flex-row justify-between px-0">
					<CardTitle className="flex items-center justify-between w-full">
						<span>Today's entries</span>
						<span className="font-mono text-muted-foreground text-sm ml-4 flex items-center gap-2">
							<MacroWithProgress value={totals.calories} goalValue={dailyGoals.calories} unit=" Cal" className="text-foreground" />
							<span>·</span>
							<MacroWithProgress value={totals.protein} goalValue={dailyGoals.protein} unit="g P" />
							<span>·</span>
							<MacroWithProgress value={totals.carbs} goalValue={dailyGoals.carbs} unit="g C" />
							<span>·</span>
							<MacroWithProgress value={totals.fat} goalValue={dailyGoals.fat} unit="g F" />
							<span>·</span>
							<MacroWithProgress value={totals.fiber} goalValue={dailyGoals.fiber} unit="g Fib" />
						</span>
					</CardTitle>

					<div className="flex gap-2 lg:hidden">
						<CarouselPrevious className="translate-0 static" />
						<CarouselNext className="translate-0 static" />
					</div>
				</CardHeader>

				<CardContent className="px-0">
					<CarouselContent>
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
								<CarouselItem key={mealType} className={cn("space-y-3", mealsWithEntries.length === 2 ? "lg:basis-1/2" : mealsWithEntries.length === 3 ? "lg:basis-1/3" : "")}>
									<div className="space-y-0.5">
										<div className="flex items-center justify-between">
											<div className="font-bold text-xs capitalize">{mealType}</div>
											<MacroWithProgress value={mealTotals.calories} goalValue={mealGoal?.calories} unit=" Cal" className="text-foreground font-mono text-xs" compact />
										</div>
										<div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
											<MacroWithProgress value={mealTotals.protein} goalValue={mealGoal?.protein} unit="g P" className="text-[10px]" compact />
											<MacroWithProgress value={mealTotals.carbs} goalValue={mealGoal?.carbs} unit="g C" className="text-[10px]" compact />
											<MacroWithProgress value={mealTotals.fat} goalValue={mealGoal?.fat} unit="g F" className="text-[10px]" compact />
											<MacroWithProgress value={mealTotals.fiber} goalValue={mealGoal?.fiber} unit="g Fib" className="text-[10px]" compact />
										</div>
									</div>

									<div className="space-y-2">
										{entries.map((entry) => {
											const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
											if (!food) return null

											return <EntryItem key={entry._id} entry={entry} food={food} dropdownItems={{ edit: true, delete: true, viewFood: true }} hideMealType />
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
