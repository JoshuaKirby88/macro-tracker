"use client"

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react"
import type { AnyFieldApi } from "@tanstack/react-form"
import { useForm } from "@tanstack/react-form"
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

function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em> : null}
			{field.state.meta.isValidating ? <span className="text-xs text-muted-foreground">Validating...</span> : null}
		</>
	)
}

type GoalDefaults = {
	calories: string
	protein: string
	fat: string
	carbs: string
}

function GoalForm(props: { defaults: GoalDefaults; today: string; upsert: ReturnType<typeof useMutation<typeof api.goals.upsertForDate>> }) {
	const { defaults, today, upsert } = props as any
	const [message, setMessage] = React.useState<string | null>(null)

	const toOptionalNumber = (v: string): number | undefined => {
		const trimmed = v.trim()
		if (trimmed === "") return undefined
		return Number(trimmed)
	}

	const form = useForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			setMessage(null)
			try {
				await upsert({
					forDate: today,
					calories: toOptionalNumber(value.calories),
					protein: toOptionalNumber(value.protein),
					fat: toOptionalNumber(value.fat),
					carbs: toOptionalNumber(value.carbs),
				})
				setMessage("Saved. Applies today and future days.")
			} catch (err: any) {
				setMessage(err?.message ?? "Failed to save goal")
			}
		},
	})

	const numberValidator = ({ value }: { value: string }) => {
		if (value.trim() === "") return undefined
		const n = Number(value)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
				<CardDescription>Set goals effective for today ({today}) and all future days. Past days remain unchanged.</CardDescription>
			</CardHeader>

			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
			>
				<CardContent className="grid gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Calories</span>
							<form.Field
								name="calories"
								validators={{ onChange: numberValidator }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={10}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 2200"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Protein (g)</span>
							<form.Field
								name="protein"
								validators={{ onChange: numberValidator }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 160"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Fat (g)</span>
							<form.Field
								name="fat"
								validators={{ onChange: numberValidator }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 70"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Carbs (g)</span>
							<form.Field
								name="carbs"
								validators={{ onChange: numberValidator }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 250"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>
					</div>

					{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
				</CardContent>

				<CardFooter className="justify-end">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "Saving…" : "Save goals"}
							</Button>
						)}
					/>
				</CardFooter>
			</form>
		</Card>
	)
}

function SettingsContent() {
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

	if (goal === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Daily macro goals</CardTitle>
					<CardDescription>Set goals effective for today ({today}) and all future days. Past days remain unchanged.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">Loading…</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button disabled>Save goals</Button>
				</CardFooter>
			</Card>
		)
	}

	const defaults: GoalDefaults = {
		calories: goal?.calories != null ? String(goal.calories) : "",
		protein: goal?.protein != null ? String(goal.protein) : "",
		fat: goal?.fat != null ? String(goal.fat) : "",
		carbs: goal?.carbs != null ? String(goal.carbs) : "",
	}

	return <GoalForm defaults={defaults} today={today} upsert={upsert as any} />
}

const Page: React.FC = () => {
	const token = useAuthToken()
	const { signIn } = useAuthActions()
	return token === null ? (
		<Card>
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
				<CardDescription>Sign in to view and save your goals.</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button onClick={() => void signIn("anonymous")}>Sign in</Button>
			</CardFooter>
		</Card>
	) : (
		<SettingsContent />
	)
}

export default Page
