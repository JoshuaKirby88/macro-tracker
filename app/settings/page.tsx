"use client"

import { useMutation, useQuery } from "convex/react"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"
import { dateFormatter } from "@/utils/date-formatter"

type GoalDefaults = {
	calories: string
	protein: string
	fat: string
	carbs: string
}

function GoalForm(props: { defaults: GoalDefaults; today: string; upsert: ReturnType<typeof useMutation<typeof api.goals.createOrUpdate>> }) {
	const { defaults, today, upsert } = props as any
	const [message, setMessage] = React.useState<string | null>(null)

	const [calories, setCalories] = React.useState<string>(defaults.calories)
	const [protein, setProtein] = React.useState<string>(defaults.protein)
	const [fat, setFat] = React.useState<string>(defaults.fat)
	const [carbs, setCarbs] = React.useState<string>(defaults.carbs)

	const [touchedCalories, setTouchedCalories] = React.useState(false)
	const [touchedProtein, setTouchedProtein] = React.useState(false)
	const [touchedFat, setTouchedFat] = React.useState(false)
	const [touchedCarbs, setTouchedCarbs] = React.useState(false)

	const [isSubmitting, setIsSubmitting] = React.useState(false)

	// Keep local state in sync if defaults change (e.g., after data loads)
	React.useEffect(() => {
		setCalories(defaults.calories)
		setProtein(defaults.protein)
		setFat(defaults.fat)
		setCarbs(defaults.carbs)
	}, [defaults.calories, defaults.protein, defaults.fat, defaults.carbs])

	const toOptionalNumber = (value: string): number | undefined => {
		const trimmed = value.trim()
		if (trimmed === "") return undefined
		return Number(trimmed)
	}

	const validateNumberString = (value: string): string | undefined => {
		const trimmed = value.trim()
		if (trimmed === "") return undefined
		const n = Number(trimmed)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}

	const caloriesError = validateNumberString(calories)
	const proteinError = validateNumberString(protein)
	const fatError = validateNumberString(fat)
	const carbsError = validateNumberString(carbs)
	const hasErrors = Boolean(caloriesError || proteinError || fatError || carbsError)
	const canSubmit = !isSubmitting && !hasErrors

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!canSubmit) return
		setMessage(null)
		setIsSubmitting(true)
		try {
			await upsert({
				forDate: today,
				calories: toOptionalNumber(calories),
				protein: toOptionalNumber(protein),
				fat: toOptionalNumber(fat),
				carbs: toOptionalNumber(carbs),
			})
			setMessage("Saved. Applies today and future days.")
		} catch (err: any) {
			setMessage(err?.message ?? "Failed to save goal")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
				<CardDescription>Set goals effective for today ({today}) and all future days. Past days remain unchanged.</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent className="grid gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="grid gap-1">
							<label htmlFor="calories" className="text-sm text-muted-foreground">
								Calories
							</label>
							<input
								id="calories"
								name="calories"
								type="number"
								min={0}
								step={10}
								value={calories}
								onChange={(e) => setCalories(e.target.value)}
								onBlur={() => setTouchedCalories(true)}
								aria-invalid={touchedCalories && Boolean(caloriesError)}
								aria-describedby={touchedCalories && caloriesError ? "calories-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 2200"
							/>
							{touchedCalories && caloriesError ? (
								<em id="calories-error" className="text-xs text-destructive">
									{caloriesError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="protein" className="text-sm text-muted-foreground">
								Protein (g)
							</label>
							<input
								id="protein"
								name="protein"
								type="number"
								min={0}
								step={1}
								value={protein}
								onChange={(e) => setProtein(e.target.value)}
								onBlur={() => setTouchedProtein(true)}
								aria-invalid={touchedProtein && Boolean(proteinError)}
								aria-describedby={touchedProtein && proteinError ? "protein-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 160"
							/>
							{touchedProtein && proteinError ? (
								<em id="protein-error" className="text-xs text-destructive">
									{proteinError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="fat" className="text-sm text-muted-foreground">
								Fat (g)
							</label>
							<input
								id="fat"
								name="fat"
								type="number"
								min={0}
								step={1}
								value={fat}
								onChange={(e) => setFat(e.target.value)}
								onBlur={() => setTouchedFat(true)}
								aria-invalid={touchedFat && Boolean(fatError)}
								aria-describedby={touchedFat && fatError ? "fat-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 70"
							/>
							{touchedFat && fatError ? (
								<em id="fat-error" className="text-xs text-destructive">
									{fatError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="carbs" className="text-sm text-muted-foreground">
								Carbs (g)
							</label>
							<input
								id="carbs"
								name="carbs"
								type="number"
								min={0}
								step={1}
								value={carbs}
								onChange={(e) => setCarbs(e.target.value)}
								onBlur={() => setTouchedCarbs(true)}
								aria-invalid={touchedCarbs && Boolean(carbsError)}
								aria-describedby={touchedCarbs && carbsError ? "carbs-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 250"
							/>
							{touchedCarbs && carbsError ? (
								<em id="carbs-error" className="text-xs text-destructive">
									{carbsError}
								</em>
							) : null}
						</div>
					</div>

					{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
				</CardContent>

				<CardFooter className="justify-end">
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "Saving…" : "Save goals"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

const Page = () => {
	const today = dateFormatter.getLocalDateString(new Date())
	const goal = useQuery(api.goals.forDate, { forDate: today })
	const upsert = useMutation(api.goals.createOrUpdate)

	const defaults: GoalDefaults = {
		calories: goal?.calories != null ? String(goal.calories) : "",
		protein: goal?.protein != null ? String(goal.protein) : "",
		fat: goal?.fat != null ? String(goal.fat) : "",
		carbs: goal?.carbs != null ? String(goal.carbs) : "",
	}

	return <GoalForm defaults={defaults} today={today} upsert={upsert} />
}

export default Page
