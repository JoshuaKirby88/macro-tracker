"use client"

import { type Preloaded, usePreloadedQuery } from "convex/react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart"
import type { api } from "@/convex/_generated/api"

import { entryUtil } from "@/utils/entry-util"

const chartConfig: ChartConfig = {
	calories: { label: "Calories", color: "#6366f1" },
	fat: { label: "Fat", color: "#22c55e" },
	carbs: { label: "Carbs", color: "#f97316" },
	protein: { label: "Protein", color: "#ef4444" },
}

export const MacroBarChart = (props: { preloadedEntries: Preloaded<typeof api.entries.withFoodsForDate>; preloadedGoal: Preloaded<typeof api.goals.forDate> }) => {
	const entriesWithFoods = usePreloadedQuery(props.preloadedEntries)
	const goal = usePreloadedQuery(props.preloadedGoal)

	if (!entriesWithFoods) {
		return null
	}

	const totals = entryUtil.getTotals(entriesWithFoods)

	const series = [
		{ id: "calories", label: "Calories", consumed: Math.round(totals.calories), goal: goal?.calories ?? 0 },
		{ id: "fat", label: "Fat (g)", consumed: Math.round(totals.fat), goal: goal?.fat ?? 0 },
		{ id: "carbs", label: "Carbs (g)", consumed: Math.round(totals.carbs), goal: goal?.carbs ?? 0 },
		{ id: "protein", label: "Protein (g)", consumed: Math.round(totals.protein), goal: goal?.protein ?? 0 },
	] as const

	const gramMaxConsumed = Math.max(...series.filter((s) => s.id !== "calories").map((s) => s.consumed)) || 1
	const data = series.map((m) => ({
		...m,
		percent: (m.goal > 0 ? m.consumed / m.goal : m.id === "calories" ? 1 : m.consumed / gramMaxConsumed) * 100,
	}))
	const yMax = Math.max(100, ...data.map((d) => d.percent))

	return (
		<Card>
			<CardHeader>
				<CardTitle>Macro progress</CardTitle>
			</CardHeader>

			<CardContent className="grid gap-3">
				<ChartContainer config={chartConfig} className="h-[320px] w-full">
					<BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis dataKey="label" tickLine={false} axisLine={false} />
						<YAxis unit="%" domain={[0, yMax]} tickLine={false} axisLine={false} />
						<ChartTooltip
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.25 }}
							content={
								<ChartTooltipContent
									hideLabel
									nameKey="label"
									formatter={(value, _name, item, _index) => {
										const datum = item?.payload as (typeof data)[number] | undefined
										const numeric = typeof value === "number" ? value : Number(value)
										if (!datum || Number.isNaN(numeric)) return null
										return (
											<div className="flex w-full flex-col gap-0.5">
												<div className="flex items-center justify-between">
													<span>{datum.label}</span>
													<span className="font-medium font-mono">{Math.round(numeric)}%</span>
												</div>
												<div className="text-muted-foreground">
													{datum.consumed.toLocaleString()} / {datum.goal > 0 ? datum.goal.toLocaleString() : "—"}
												</div>
											</div>
										)
									}}
								/>
							}
						/>

						<Bar dataKey="percent" radius={[4, 4, 0, 0]}>
							{data.map((item) => (
								<Cell key={item.id} fill={`var(--color-${item.id})`} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
