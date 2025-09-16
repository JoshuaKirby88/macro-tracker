"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart"

// Mock macro data: consumed vs goal
const mockMacros = [
	{ id: "calories", label: "Calories", consumed: 1800, goal: 2200 },
	{ id: "fat", label: "Fat (g)", consumed: 70, goal: 80 },
	{ id: "carb", label: "Carbs (g)", consumed: 220, goal: 250 },
	{ id: "protein", label: "Protein (g)", consumed: 140, goal: 160 },
	{ id: "sugar", label: "Sugar (g)", consumed: 35, goal: 50 },
	{ id: "fiber", label: "Fiber (g)", consumed: 22, goal: 30 },
]

const chartConfig: ChartConfig = {
	calories: { label: "Calories", color: "#6366f1" }, // indigo-500
	fat: { label: "Fat", color: "#22c55e" }, // green-500
	carb: { label: "Carbs", color: "#f97316" }, // orange-500
	protein: { label: "Protein", color: "#ef4444" }, // red-500
	sugar: { label: "Sugar", color: "#a855f7" }, // purple-500
	fiber: { label: "Fiber", color: "#06b6d4" }, // cyan-500
}

const data = mockMacros.map((m) => ({
	...m,
	percent: Math.min(100, (m.consumed / m.goal) * 100),
}))

export const MacroBarChart = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Macro progress</CardTitle>
				<CardDescription>Progress toward daily goals (100% = goal)</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[320px] w-full">
					<BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis dataKey="label" tickLine={false} axisLine={false} />
						<YAxis unit="%" domain={[0, 120]} tickLine={false} axisLine={false} />
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
													{datum.consumed.toLocaleString()} / {datum.goal.toLocaleString()}
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
