"use client"

import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"

export const FoodAdder: React.FC = () => {
	const foods = useQuery(api.foods.listForUser, {}) as any[] | undefined
	const createEntry = useMutation(api.entries.create)

	const [selectedFoodId, setSelectedFoodId] = React.useState<string>("")
	const [quantity, setQuantity] = React.useState<number>(1)
	const [mealType, setMealType] = React.useState<string>("")
	const [submitting, setSubmitting] = React.useState(false)
	const [message, setMessage] = React.useState<string | null>(null)

	const onAdd = async () => {
		if (!selectedFoodId || !quantity || quantity <= 0) return
		setSubmitting(true)
		setMessage(null)
		try {
			await createEntry({ foodId: selectedFoodId as any, quantity, mealType: mealType ? mealType : undefined })
			setMessage("Added to today's entries")
		} catch (err: any) {
			setMessage(err?.message ?? "Something went wrong")
		} finally {
			setSubmitting(false)
		}
	}

	const hasFoods = (foods?.length ?? 0) > 0

	return (
		<Card className="pointer-events-auto fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-screen-sm -translate-x-1/2 rounded-2xl border bg-background/90 shadow-lg backdrop-blur">
			<CardHeader className="hidden items-start justify-between gap-4 sm:flex">
				<div>
					<CardTitle>Add food</CardTitle>
					<CardDescription>Add previously created foods to today's macros.</CardDescription>
				</div>
				<div className="shrink-0">
					<Link href="/create">
						<Button variant="outline">Create new food</Button>
					</Link>
				</div>
			</CardHeader>

			<CardContent className="grid gap-4">
				{/* Mobile drag handle to suggest floating panel */}
				<div className="mx-auto block h-1.5 w-10 rounded-full bg-foreground/20 sm:hidden" />
				{hasFoods ? (
					<div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-end gap-3">
						<label className="grid gap-1">
							<span className="text-sm text-muted-foreground">Food</span>
							<select
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								value={selectedFoodId}
								onChange={(e) => setSelectedFoodId(e.target.value)}
							>
								<option value="">Select a food…</option>
								{(foods ?? []).map((f: any) => (
									<option key={f._id} value={f._id}>
										{f.name}
										{f.brand ? ` (${f.brand})` : ""} — {f.servingSize} {f.servingUnit}
									</option>
								))}
							</select>
						</label>

						<label className="grid gap-1">
							<span className="text-sm text-muted-foreground">Quantity</span>
							<input
								type="number"
								min={0.25}
								step={0.25}
								value={quantity}
								onChange={(e) => setQuantity(Number(e.target.value))}
								className="h-10 w-28 rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							/>
						</label>

						<label className="grid gap-1">
							<span className="text-sm text-muted-foreground">Meal</span>
							<select
								className="h-10 w-32 rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								value={mealType}
								onChange={(e) => setMealType(e.target.value)}
							>
								<option value="">Meal…</option>
								<option value="breakfast">Breakfast</option>
								<option value="lunch">Lunch</option>
								<option value="dinner">Dinner</option>
							</select>
						</label>

						<div className="sm:justify-self-end">
							<Button onClick={onAdd} disabled={!selectedFoodId || submitting}>
								{submitting ? "Adding…" : "Add to Today"}
							</Button>
						</div>
					</div>
				) : (
					<div className="text-sm text-muted-foreground">You haven't created any foods yet. Click "Create new food" to get started.</div>
				)}

				{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
			</CardContent>

			<CardFooter className="hidden justify-end sm:flex"></CardFooter>
		</Card>
	)
}
