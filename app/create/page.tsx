"use client"

import { useMutation } from "convex/react"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"

type NumState = number | ""

const Page: React.FC = () => {
	const createFood = useMutation(api.foods.create)
	const createEntry = useMutation(api.entries.create)

	const [name, setName] = React.useState("")
	const [brand, setBrand] = React.useState("")
	const [description, setDescription] = React.useState("")

	const [servingSize, setServingSize] = React.useState<NumState>(100)
	const [servingUnit, setServingUnit] = React.useState("g")

	const [calories, setCalories] = React.useState<NumState>(0)
	const [protein, setProtein] = React.useState<NumState>(0)
	const [fat, setFat] = React.useState<NumState>(0)
	const [carbs, setCarbs] = React.useState<NumState>(0)
	const [sugar, setSugar] = React.useState<NumState>(0)
	const [fiber, setFiber] = React.useState<NumState>("")

	const [quantity, setQuantity] = React.useState<NumState>(1)
	const [mealType, setMealType] = React.useState("")
	const [note, setNote] = React.useState("")

	const [submitting, setSubmitting] = React.useState(false)
	const [message, setMessage] = React.useState<string | null>(null)

	const parseNum = (value: string, allowZero = true): NumState => {
		if (value.trim() === "") return ""
		const n = Number(value)
		if (!Number.isFinite(n)) return ""
		if (!allowZero && n <= 0) return ""
		if (n < 0) return ""
		return n
	}

	const disabled = !name.trim() || servingSize === "" || servingUnit.trim() === "" || calories === "" || protein === "" || fat === "" || carbs === "" || sugar === ""

	const onCreate = async (alsoAdd: boolean) => {
		if (disabled) return
		setSubmitting(true)
		setMessage(null)
		try {
			const foodId = await createFood({
				name: name.trim(),
				brand: brand.trim() ? brand.trim() : undefined,
				description: description.trim() ? description.trim() : undefined,
				servingSize: Number(servingSize),
				servingUnit: servingUnit.trim(),
				calories: Number(calories),
				protein: Number(protein),
				fat: Number(fat),
				carbs: Number(carbs),
				sugar: Number(sugar),
				fiber: fiber === "" ? undefined : Number(fiber),
			})

			if (alsoAdd) {
				const qty = quantity === "" ? 1 : Number(quantity)
				await createEntry({
					foodId: foodId as any,
					quantity: qty,
					mealType: mealType.trim() ? mealType.trim() : undefined,
					note: note.trim() ? note.trim() : undefined,
				})
				setMessage("Created and added to today's entries")
			} else {
				setMessage("Food created")
			}

			// Optionally reset a subset of the form
			// Keep macros/serving to speed up multiple additions
			setName("")
			setBrand("")
			setDescription("")
			setQuantity(1)
			setMealType("")
			setNote("")
		} catch (err: any) {
			setMessage(err?.message ?? "Something went wrong")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create food</CardTitle>
				<CardDescription>Add a custom food with serving and macros.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Name</span>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., Greek yogurt"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Brand (optional)</span>
						<input
							value={brand}
							onChange={(e) => setBrand(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., Fage"
						/>
					</label>
					<label className="grid gap-1 sm:col-span-2">
						<span className="text-sm text-muted-foreground">Description (optional)</span>
						<input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 2% plain"
						/>
					</label>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Serving size</span>
						<input
							type="number"
							min={0.01}
							step={0.5}
							value={servingSize}
							onChange={(e) => setServingSize(parseNum(e.target.value, false))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 100"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Unit</span>
						<input
							value={servingUnit}
							onChange={(e) => setServingUnit(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., g, ml, piece"
						/>
					</label>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Calories</span>
						<input
							type="number"
							min={0}
							step={1}
							value={calories}
							onChange={(e) => setCalories(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 59"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Protein (g)</span>
						<input
							type="number"
							min={0}
							step={0.1}
							value={protein}
							onChange={(e) => setProtein(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 10.3"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Fat (g)</span>
						<input
							type="number"
							min={0}
							step={0.1}
							value={fat}
							onChange={(e) => setFat(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 2.3"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Carbs (g)</span>
						<input
							type="number"
							min={0}
							step={0.1}
							value={carbs}
							onChange={(e) => setCarbs(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 3.6"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Sugar (g)</span>
						<input
							type="number"
							min={0}
							step={0.1}
							value={sugar}
							onChange={(e) => setSugar(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 3.2"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Fiber (g) — optional</span>
						<input
							type="number"
							min={0}
							step={0.1}
							value={fiber}
							onChange={(e) => setFiber(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 0.0"
						/>
					</label>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Add now? Quantity</span>
						<input
							type="number"
							min={0.01}
							step={0.25}
							value={quantity}
							onChange={(e) => setQuantity(parseNum(e.target.value, false))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 1"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Meal (optional)</span>
						<input
							value={mealType}
							onChange={(e) => setMealType(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., breakfast"
						/>
					</label>
					<label className="grid gap-1 sm:col-span-1">
						<span className="text-sm text-muted-foreground">Note (optional)</span>
						<input
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., with berries"
						/>
					</label>
				</div>

				{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
			</CardContent>
			<CardFooter className="justify-end gap-2">
				<Button variant="outline" onClick={() => onCreate(false)} disabled={disabled || submitting}>
					{submitting ? "Creating…" : "Create food"}
				</Button>
				<Button onClick={() => onCreate(true)} disabled={disabled || submitting}>
					{submitting ? "Creating…" : "Create & Add to Today"}
				</Button>
			</CardFooter>
		</Card>
	)
}

export default Page
