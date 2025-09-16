"use client"

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

	// Local state for fields (string state for input compatibility)
	const [name, setName] = React.useState("")
	const [brand, setBrand] = React.useState("")
	const [description, setDescription] = React.useState("")
	const [servingSize, setServingSize] = React.useState("100")
	const [servingUnit, setServingUnit] = React.useState("g")
	const [calories, setCalories] = React.useState("0")
	const [protein, setProtein] = React.useState("0")
	const [fat, setFat] = React.useState("0")
	const [carbs, setCarbs] = React.useState("0")
	const [sugar, setSugar] = React.useState("0")
	const [fiber, setFiber] = React.useState("")
	const [quantity, setQuantity] = React.useState("1")
	const [mealType, setMealType] = React.useState("")
	const [note, setNote] = React.useState("")

	// Touched flags for validation display
	const [touchedName, setTouchedName] = React.useState(false)
	const [touchedServingSize, setTouchedServingSize] = React.useState(false)
	const [touchedServingUnit, setTouchedServingUnit] = React.useState(false)
	const [touchedCalories, setTouchedCalories] = React.useState(false)
	const [touchedProtein, setTouchedProtein] = React.useState(false)
	const [touchedFat, setTouchedFat] = React.useState(false)
	const [touchedCarbs, setTouchedCarbs] = React.useState(false)
	const [touchedSugar, setTouchedSugar] = React.useState(false)
	const [touchedFiber, setTouchedFiber] = React.useState(false)
	const [touchedQuantity, setTouchedQuantity] = React.useState(false)

	// Submit state
	const [isSubmitting, setIsSubmitting] = React.useState(false)

	// Helpers
	const toRequiredNumber = (v: string): number => Number(v.trim())
	const toOptionalNumber = (v: string): number | undefined => {
		const t = v.trim()
		return t === "" ? undefined : Number(t)
	}

	// Validators (string in, message or undefined)
	const requiredText = (value: string) => (!value.trim() ? "Required" : undefined)
	const requiredNonNegative = (value: string) => {
		if (value.trim() === "") return "Required"
		const n = Number(value)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}
	const requiredPositive = (value: string) => {
		if (value.trim() === "") return "Required"
		const n = Number(value)
		if (!Number.isFinite(n) || n <= 0) return "Must be greater than 0"
		return undefined
	}
	const optionalNonNegative = (value: string) => {
		if (value.trim() === "") return undefined
		const n = Number(value)
		if (!Number.isFinite(n) || n < 0) return "Must be a non-negative number"
		return undefined
	}

	// Error messages
	const nameError = requiredText(name)
	const servingSizeError = requiredPositive(servingSize)
	const servingUnitError = requiredText(servingUnit)
	const caloriesError = requiredNonNegative(calories)
	const proteinError = requiredNonNegative(protein)
	const fatError = requiredNonNegative(fat)
	const carbsError = requiredNonNegative(carbs)
	const sugarError = requiredNonNegative(sugar)
	const fiberError = optionalNonNegative(fiber)
	const quantityError = optionalNonNegative(quantity)
	const hasErrors = Boolean(nameError || servingSizeError || servingUnitError || caloriesError || proteinError || fatError || carbsError || sugarError || fiberError || quantityError)
	const canSubmit = !isSubmitting && !hasErrors

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()
		e.stopPropagation()
		if (!canSubmit) return
		setMessage(null)
		setIsSubmitting(true)
		try {
			const foodId = await createFood({
				name: name.trim(),
				brand: brand.trim() ? brand.trim() : undefined,
				description: description.trim() ? description.trim() : undefined,
				servingSize: toRequiredNumber(servingSize),
				servingUnit: servingUnit.trim(),
				calories: toRequiredNumber(calories),
				protein: toRequiredNumber(protein),
				fat: toRequiredNumber(fat),
				carbs: toRequiredNumber(carbs),
				sugar: toRequiredNumber(sugar),
				fiber: toOptionalNumber(fiber),
			})

			if (submitModeRef.current === "createAdd") {
				const qty = quantity.trim() === "" ? 1 : Number(quantity)
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
		} catch (err: any) {
			setMessage(err?.message ?? "Something went wrong")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create food</CardTitle>
				<CardDescription>Add a custom food with serving and macros.</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="grid gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="grid gap-1">
							<label htmlFor="name" className="text-sm text-muted-foreground">
								Name
							</label>
							<input
								id="name"
								name="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => setTouchedName(true)}
								aria-invalid={touchedName && Boolean(nameError)}
								aria-describedby={touchedName && nameError ? "name-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., Greek yogurt"
							/>
							{touchedName && nameError ? (
								<em id="name-error" className="text-xs text-destructive">
									{nameError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="brand" className="text-sm text-muted-foreground">
								Brand (optional)
							</label>
							<input
								id="brand"
								name="brand"
								value={brand}
								onChange={(e) => setBrand(e.target.value)}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., Fage"
							/>
						</div>

						<div className="grid gap-1 sm:col-span-2">
							<label htmlFor="description" className="text-sm text-muted-foreground">
								Description (optional)
							</label>
							<input
								id="description"
								name="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 2% plain"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<label htmlFor="servingSize" className="text-sm text-muted-foreground">
								Serving size
							</label>
							<input
								id="servingSize"
								name="servingSize"
								type="number"
								min={0.01}
								step={0.01}
								value={servingSize}
								onChange={(e) => setServingSize(e.target.value)}
								onBlur={() => setTouchedServingSize(true)}
								aria-invalid={touchedServingSize && Boolean(servingSizeError)}
								aria-describedby={touchedServingSize && servingSizeError ? "servingSize-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 100"
							/>
							{touchedServingSize && servingSizeError ? (
								<em id="servingSize-error" className="text-xs text-destructive">
									{servingSizeError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="servingUnit" className="text-sm text-muted-foreground">
								Unit
							</label>
							<input
								id="servingUnit"
								name="servingUnit"
								value={servingUnit}
								onChange={(e) => setServingUnit(e.target.value)}
								onBlur={() => setTouchedServingUnit(true)}
								aria-invalid={touchedServingUnit && Boolean(servingUnitError)}
								aria-describedby={touchedServingUnit && servingUnitError ? "servingUnit-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., g, ml, piece"
							/>
							{touchedServingUnit && servingUnitError ? (
								<em id="servingUnit-error" className="text-xs text-destructive">
									{servingUnitError}
								</em>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<label htmlFor="calories" className="text-sm text-muted-foreground">
								Calories
							</label>
							<input
								id="calories"
								name="calories"
								type="number"
								min={0}
								step={1}
								value={calories}
								onChange={(e) => setCalories(e.target.value)}
								onBlur={() => setTouchedCalories(true)}
								aria-invalid={touchedCalories && Boolean(caloriesError)}
								aria-describedby={touchedCalories && caloriesError ? "calories-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 59"
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
								step={0.1}
								value={protein}
								onChange={(e) => setProtein(e.target.value)}
								onBlur={() => setTouchedProtein(true)}
								aria-invalid={touchedProtein && Boolean(proteinError)}
								aria-describedby={touchedProtein && proteinError ? "protein-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 10.3"
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
								step={0.1}
								value={fat}
								onChange={(e) => setFat(e.target.value)}
								onBlur={() => setTouchedFat(true)}
								aria-invalid={touchedFat && Boolean(fatError)}
								aria-describedby={touchedFat && fatError ? "fat-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 2.3"
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
								step={0.1}
								value={carbs}
								onChange={(e) => setCarbs(e.target.value)}
								onBlur={() => setTouchedCarbs(true)}
								aria-invalid={touchedCarbs && Boolean(carbsError)}
								aria-describedby={touchedCarbs && carbsError ? "carbs-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 3.6"
							/>
							{touchedCarbs && carbsError ? (
								<em id="carbs-error" className="text-xs text-destructive">
									{carbsError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="sugar" className="text-sm text-muted-foreground">
								Sugar (g)
							</label>
							<input
								id="sugar"
								name="sugar"
								type="number"
								min={0}
								step={0.1}
								value={sugar}
								onChange={(e) => setSugar(e.target.value)}
								onBlur={() => setTouchedSugar(true)}
								aria-invalid={touchedSugar && Boolean(sugarError)}
								aria-describedby={touchedSugar && sugarError ? "sugar-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 3.2"
							/>
							{touchedSugar && sugarError ? (
								<em id="sugar-error" className="text-xs text-destructive">
									{sugarError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="fiber" className="text-sm text-muted-foreground">
								Fiber (g) — optional
							</label>
							<input
								id="fiber"
								name="fiber"
								type="number"
								min={0}
								step={0.1}
								value={fiber}
								onChange={(e) => setFiber(e.target.value)}
								onBlur={() => setTouchedFiber(true)}
								aria-invalid={touchedFiber && Boolean(fiberError)}
								aria-describedby={touchedFiber && fiberError ? "fiber-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 0.0"
							/>
							{touchedFiber && fiberError ? (
								<em id="fiber-error" className="text-xs text-destructive">
									{fiberError}
								</em>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="grid gap-1">
							<label htmlFor="quantity" className="text-sm text-muted-foreground">
								Add now? Quantity
							</label>
							<input
								id="quantity"
								name="quantity"
								type="number"
								min={0.25}
								step={0.25}
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								onBlur={() => setTouchedQuantity(true)}
								aria-invalid={touchedQuantity && Boolean(quantityError)}
								aria-describedby={touchedQuantity && quantityError ? "quantity-error" : undefined}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., 1"
							/>
							{touchedQuantity && quantityError ? (
								<em id="quantity-error" className="text-xs text-destructive">
									{quantityError}
								</em>
							) : null}
						</div>

						<div className="grid gap-1">
							<label htmlFor="mealType" className="text-sm text-muted-foreground">
								Meal (optional)
							</label>
							<select
								id="mealType"
								name="mealType"
								value={mealType}
								onChange={(e) => setMealType(e.target.value)}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
							>
								<option value="">Select meal…</option>
								<option value="breakfast">Breakfast</option>
								<option value="lunch">Lunch</option>
								<option value="dinner">Dinner</option>
							</select>
						</div>

						<div className="grid gap-1 sm:col-span-1">
							<label htmlFor="note" className="text-sm text-muted-foreground">
								Note (optional)
							</label>
							<input
								id="note"
								name="note"
								value={note}
								onChange={(e) => setNote(e.target.value)}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
								placeholder="e.g., with berries"
							/>
						</div>
					</div>

					{message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
				</CardContent>

				<CardFooter className="justify-end gap-2">
					<Button variant="outline" type="submit" disabled={!canSubmit} onClick={() => (submitModeRef.current = "create")}>
						{isSubmitting ? "Creating…" : "Create food"}
					</Button>
					<Button type="submit" disabled={!canSubmit} onClick={() => (submitModeRef.current = "createAdd")}>
						{isSubmitting ? "Creating…" : "Create & Add to Today"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

export default Page
