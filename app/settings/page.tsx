"use client"

import { useMutation, useQuery } from "convex/react"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"

// Utility to format today's date as YYYY-MM-DD in local time
function formatLocalDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

const Page: React.FC = () => {
	const today = React.useMemo(() => formatLocalDate(new Date()), [])
	const goal = useQuery(api.goals.getForDate, { forDate: today }) as
		| {
				_id: string
				calories?: number
				protein?: number
				fat?: number
				carbs?: number
		  }
		| null
		| undefined
	const upsert = useMutation(api.goals.upsertForDate)

	const [calories, setCalories] = React.useState<number | "">("")
	const [protein, setProtein] = React.useState<number | "">("")
	const [fat, setFat] = React.useState<number | "">("")
	const [carbs, setCarbs] = React.useState<number | "">("")
	const [saving, setSaving] = React.useState(false)
	const [message, setMessage] = React.useState<string | null>(null)

	// Hydrate form from real-time query
	React.useEffect(() => {
		if (goal === undefined) return // loading
		if (goal === null) {
			setCalories("")
			setProtein("")
			setFat("")
			setCarbs("")
			return
		}
		setCalories(typeof goal.calories === "number" ? goal.calories : "")
		setProtein(typeof goal.protein === "number" ? goal.protein : "")
		setFat(typeof goal.fat === "number" ? goal.fat : "")
		setCarbs(typeof goal.carbs === "number" ? goal.carbs : "")
	}, [goal])

	const parseNum = (value: string): number | "" => {
		if (value.trim() === "") return ""
		const n = Number(value)
		return Number.isFinite(n) && n >= 0 ? n : ""
	}

	const handleSave = async () => {
		setSaving(true)
		setMessage(null)
		try {
			await upsert({
				forDate: today,
				calories: calories === "" ? undefined : Number(calories),
				protein: protein === "" ? undefined : Number(protein),
				fat: fat === "" ? undefined : Number(fat),
				carbs: carbs === "" ? undefined : Number(carbs),
			})
			setMessage("Saved. Applies today and future days.")
		} catch (err: any) {
			setMessage(err?.message ?? "Failed to save goal")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
				<CardDescription>Set goals effective for today ({today}) and all future days. Past days remain unchanged.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Calories</span>
						<input
							type="number"
							min={0}
							step={10}
							value={calories}
							onChange={(e) => setCalories(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 2200"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Protein (g)</span>
						<input
							type="number"
							min={0}
							step={1}
							value={protein}
							onChange={(e) => setProtein(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 160"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Fat (g)</span>
						<input
							type="number"
							min={0}
							step={1}
							value={fat}
							onChange={(e) => setFat(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 70"
						/>
					</label>
					<label className="grid gap-1">
						<span className="text-sm text-muted-foreground">Carbs (g)</span>
						<input
							type="number"
							min={0}
							step={1}
							value={carbs}
							onChange={(e) => setCarbs(parseNum(e.target.value))}
							className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							placeholder="e.g., 250"
						/>
					</label>
				</div>

				{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
			</CardContent>
			<CardFooter className="justify-end">
				<Button onClick={handleSave} disabled={saving}>
					{saving ? "Saving…" : "Save goals"}
				</Button>
			</CardFooter>
		</Card>
	)
}

export default Page
