"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "convex/react"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"

const Page: React.FC = () => {
	const createFood = useMutation(api.foods.create)
	const createEntry = useMutation(api.entries.create)

	// Message after submission
	const [message, setMessage] = React.useState<string | null>(null)

	// Track which submit action was used
	const submitModeRef = React.useRef<"create" | "createAdd">("create")

	// Helpers
	const toRequiredNumber = (v: string): number => Number(v.trim())
	const toOptionalNumber = (v: string): number | undefined => {
		const t = v.trim()
		return t === "" ? undefined : Number(t)
	}

	function FieldInfo({ field }: { field: AnyFieldApi }) {
		return (
			<>
				{field.state.meta.isTouched && !field.state.meta.isValid ? <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em> : null}
				{field.state.meta.isValidating ? <span className="text-xs text-muted-foreground">Validating...</span> : null}
			</>
		)
	}

	const form = useForm({
		defaultValues: {
			name: "",
			brand: "",
			description: "",
			servingSize: "100",
			servingUnit: "g",
			calories: "0",
			protein: "0",
			fat: "0",
			carbs: "0",
			sugar: "0",
			fiber: "",
			quantity: "1",
			mealType: "",
			note: "",
		},
		onSubmit: async ({ value }) => {
			setMessage(null)
			try {
				const foodId = await createFood({
					name: value.name.trim(),
					brand: value.brand.trim() ? value.brand.trim() : undefined,
					description: value.description.trim() ? value.description.trim() : undefined,
					servingSize: toRequiredNumber(value.servingSize),
					servingUnit: value.servingUnit.trim(),
					calories: toRequiredNumber(value.calories),
					protein: toRequiredNumber(value.protein),
					fat: toRequiredNumber(value.fat),
					carbs: toRequiredNumber(value.carbs),
					sugar: toRequiredNumber(value.sugar),
					fiber: toOptionalNumber(value.fiber),
				})

				if (submitModeRef.current === "createAdd") {
					const qty = value.quantity.trim() === "" ? 1 : Number(value.quantity)
					await createEntry({
						foodId: foodId as any,
						quantity: qty,
						mealType: value.mealType.trim() ? value.mealType.trim() : undefined,
						note: value.note.trim() ? value.note.trim() : undefined,
					})
					setMessage("Created and added to today's entries")
				} else {
					setMessage("Food created")
				}
			} catch (err: any) {
				setMessage(err?.message ?? "Something went wrong")
			}
		},
	})

	// Validators
	const requiredText = ({ value }: { value: string }) => (!value.trim() ? "Required" : undefined)
	const requiredNonNegative = ({ value }: { value: string }) => {
		if (value.trim() === "") return "Required"
		const n = Number(value)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}
	const requiredPositive = ({ value }: { value: string }) => {
		if (value.trim() === "") return "Required"
		const n = Number(value)
		if (!Number.isFinite(n) || n <= 0) return "Must be greater than 0"
		return undefined
	}
	const optionalNonNegative = ({ value }: { value: string }) => {
		if (value.trim() === "") return undefined
		const n = Number(value)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create food</CardTitle>
				<CardDescription>Add a custom food with serving and macros.</CardDescription>
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
							<span className="text-sm text-muted-foreground">Name</span>
							<form.Field
								name="name"
								validators={{ onChange: requiredText }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., Greek yogurt"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Brand (optional)</span>
							<form.Field
								name="brand"
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., Fage"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1 sm:col-span-2">
							<span className="text-sm text-muted-foreground">Description (optional)</span>
							<form.Field
								name="description"
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 2% plain"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Serving size</span>
							<form.Field
								name="servingSize"
								validators={{ onChange: requiredPositive }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0.01}
											step={0.5}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 100"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Unit</span>
							<form.Field
								name="servingUnit"
								validators={{ onChange: requiredText }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., g, ml, piece"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Calories</span>
							<form.Field
								name="calories"
								validators={{ onChange: requiredNonNegative }}
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
											placeholder="e.g., 59"
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
								validators={{ onChange: requiredNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={0.1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 10.3"
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
								validators={{ onChange: requiredNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={0.1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 2.3"
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
								validators={{ onChange: requiredNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={0.1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 3.6"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Sugar (g)</span>
							<form.Field
								name="sugar"
								validators={{ onChange: requiredNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={0.1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 3.2"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Fiber (g) — optional</span>
							<form.Field
								name="fiber"
								validators={{ onChange: optionalNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											step={0.1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 0.0"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Add now? Quantity</span>
							<form.Field
								name="quantity"
								validators={{ onChange: optionalNonNegative }}
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											type="number"
											min={0.01}
											step={0.25}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., 1"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1">
							<span className="text-sm text-muted-foreground">Meal (optional)</span>
							<form.Field
								name="mealType"
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., breakfast"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>

						<div className="grid gap-1 sm:col-span-1">
							<span className="text-sm text-muted-foreground">Note (optional)</span>
							<form.Field
								name="note"
								children={(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
											placeholder="e.g., with berries"
										/>
										<FieldInfo field={field} />
									</>
								)}
							/>
						</div>
					</div>

					{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
				</CardContent>

				<CardFooter className="justify-end gap-2">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<>
								<Button variant="outline" type="submit" disabled={!canSubmit} onClick={() => (submitModeRef.current = "create")}>
									{isSubmitting ? "Creating…" : "Create food"}
								</Button>
								<Button type="submit" disabled={!canSubmit} onClick={() => (submitModeRef.current = "createAdd")}>
									{isSubmitting ? "Creating…" : "Create & Add to Today"}
								</Button>
							</>
						)}
					/>
				</CardFooter>
			</form>
		</Card>
	)
}

export default Page
