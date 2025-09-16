"use client"

import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"
import { capitalize } from "@/utils/capitalize"
import { dateFormatter } from "@/utils/date-formatter"

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "other"] as const

export const TodayEntries = () => {
	const today = dateFormatter.getLocalDateString(new Date())
	const result = useQuery(api.entries.listForDate, { forDate: today })

	if (result === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Today’s entries</CardTitle>
					<CardDescription>Food you have logged today by meal.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">Loading…</div>
				</CardContent>
			</Card>
		)
	}

	if (result === null) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Today’s entries</CardTitle>
					<CardDescription>Food you have logged today by meal.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">Sign in to view today’s entries.</div>
				</CardContent>
			</Card>
		)
	}

	const entries = result.entries

	if (!entries || entries.length === 0) {
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

	// Group entries by meal type
	const groups = new Map<string, Array<any>>()
	for (const entry of entries) {
		const key = (entry.mealType as string | undefined)?.toLowerCase() || "other"
		const arr = groups.get(key) ?? []
		arr.push(entry)
		groups.set(key, arr)
	}

	// Determine render order: predefined meal order, then any custom types
	const keys = Array.from(groups.keys())
	const orderedKeys = keys.sort((a, b) => {
		const ia = MEAL_ORDER.indexOf(a as any)
		const ib = MEAL_ORDER.indexOf(b as any)
		const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
		const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
		if (ra !== rb) return ra - rb
		return a.localeCompare(b)
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Today’s entries</CardTitle>
				<CardDescription>Food you have logged today by meal.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-6">
				{orderedKeys.map((mealKey) => {
					const list = groups.get(mealKey) ?? []
					const label = mealKey === "other" ? "Other" : capitalize(mealKey)
					return (
						<div key={mealKey} className="grid gap-3">
							<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
							<div className="grid gap-2">
								{list.map((e: any) => {
									const food = e.food
									const name = food ? food.name : "[deleted food]"
									const brand = food?.brand ? ` (${food.brand})` : ""
									const serving = food ? `${food.servingSize} ${food.servingUnit}` : ""
									const qty = e.quantity
									const cals = Math.round(e.contributions?.calories ?? 0)
									const macros = e.contributions
									return (
										<div key={e._id} className="flex items-start justify-between rounded-md border p-3">
											<div className="min-w-0">
												<div className="truncate font-medium">
													{name}
													{brand}
												</div>
												<div className="text-xs text-muted-foreground">
													{qty} × {serving}
												</div>
											</div>
											<div className="shrink-0 text-right">
												<div className="font-mono text-sm font-semibold">{cals.toLocaleString()} kcal</div>
												<div className="text-[10px] text-muted-foreground">
													{Math.round(macros?.protein ?? 0)}g P · {Math.round(macros?.carbs ?? 0)}g C · {Math.round(macros?.fat ?? 0)}g F
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>
					)
				})}
			</CardContent>
		</Card>
	)
}
