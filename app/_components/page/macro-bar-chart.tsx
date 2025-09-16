"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart"
import { api } from "@/convex/_generated/api"

// Utility to format today's date as YYYY-MM-DD in local time
function formatLocalDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

const chartConfig: ChartConfig = {
	calories: { label: "Calories", color: "#6366f1" }, // indigo-500
	fat: { label: "Fat", color: "#22c55e" }, // green-500
	carbs: { label: "Carbs", color: "#f97316" }, // orange-500
	protein: { label: "Protein", color: "#ef4444" }, // red-500
}

export const MacroBarChart = () => {
	const today = React.useMemo(() => formatLocalDate(new Date()), [])

	// Query today's totals and goal. Cast to any until Convex typegen updates.
	const totalsResult = useQuery((api as any).entries.totalsForDate, { forDate: today }) as
		| { forDate: string; totals: { calories: number; protein: number; fat: number; carbs: number; sugar: number; fiber: number } }
		| null
		| undefined

	const goal = useQuery(api.goals.getForDate, { forDate: today }) as { calories?: number; protein?: number; fat?: number; carbs?: number } | null | undefined

	if (totalsResult === undefined || goal === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Macro progress</CardTitle>
					<CardDescription>Progress toward daily goals (100% = goal)</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">Loading…</div>
				</CardContent>
			</Card>
		)
	}

	if (totalsResult === null) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Macro progress</CardTitle>
					<CardDescription>Progress toward daily goals (100% = goal)</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">Sign in to track today’s macros.</div>
				</CardContent>
			</Card>
		)
	}

	const totals = totalsResult.totals

	const series = [
		{ id: "calories", label: "Calories", consumed: Math.round(totals.calories), goal: goal?.calories ?? 0 },
		{ id: "fat", label: "Fat (g)", consumed: Math.round(totals.fat), goal: goal?.fat ?? 0 },
		{ id: "carbs", label: "Carbs (g)", consumed: Math.round(totals.carbs), goal: goal?.carbs ?? 0 },
		{ id: "protein", label: "Protein (g)", consumed: Math.round(totals.protein), goal: goal?.protein ?? 0 },
	] as const

	const data = series.map((m) => ({
		...m,
		percent: m.goal > 0 ? Math.min(150, (m.consumed / m.goal) * 100) : 0,
	}))

	const anyGoalsSet = (goal?.calories ?? goal?.protein ?? goal?.fat ?? goal?.carbs) != null

	return (
		<Card>
			<CardHeader>
				<CardTitle>Macro progress</CardTitle>
				<CardDescription>Progress toward daily goals (100% = goal)</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3">
				{!anyGoalsSet ? <div className="text-xs text-muted-foreground">No goals set for today. Set them in Settings.</div> : null}

				<ChartContainer config={chartConfig} className="h-[320px] w-full">
					<BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis dataKey="label" tickLine={false} axisLine={false} />
						<YAxis unit="%" domain={[0, 150]} tickLine={false} axisLine={false} />
						<ChartTooltip
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.25 } as any}
							content={
								<ChartTooltipContent
									hideLabel
									nameKey="label"
									formatter={(value: any, _name: any, item: any, _index: any) => {
										const datum = item?.payload as (typeof data)[number] | undefined
										const numeric = typeof value === "number" ? value : Number(value)
										if (!datum || Number.isNaN(numeric)) return null
										return (
											<div className="flex w-full flex-col gap-0.5">
												<div className="flex items-center justify-between">
													<span>{datum.label}</span>
													<span className="font-mono font-medium">{Math.round(numeric)}%</span>
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
