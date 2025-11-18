"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { createOrUpdateGoalSchema } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"

const calculateCaloriesFromMacros = (protein: number | undefined, carbs: number | undefined, fat: number | undefined): number | undefined => {
	if (protein === undefined && carbs === undefined && fat === undefined) return undefined
	const p = protein ?? 0
	const c = carbs ?? 0
	const f = fat ?? 0
	return p * 4 + c * 4 + f * 9
}

const config = {
	schema: createOrUpdateGoalSchema.omit({ startDate: true }),
	macros: ["calories", "protein", "fat", "carbs", "fiber"] as const,
}

export const SettingsForm = () => {
	const today = dateUtil.getDateString(new Date())
	const goal = useQuery(api.goals.forDate, { date: today })
	const createOrUpdateGoal = useMutation(api.goals.createOrUpdate)
	const form = useForm({
		resolver: zodResolver(config.schema),
		defaultValues: goal ?? {
			breakfast: undefined,
			lunch: undefined,
			dinner: undefined,
		},
	})

	useEffect(() => {
		if (goal) {
			form.reset({
				breakfast: goal.breakfast ?? undefined,
				lunch: goal.lunch ?? undefined,
				dinner: goal.dinner ?? undefined,
			})
		}
	}, [goal, form])

	const formValues = form.watch()

	const dailyTotals = useMemo(() => {
		const breakfast = formValues.breakfast
		const lunch = formValues.lunch
		const dinner = formValues.dinner

		const getSum = (key: "calories" | "protein" | "fat" | "carbs" | "fiber") => {
			const sum = (breakfast?.[key] ?? 0) + (lunch?.[key] ?? 0) + (dinner?.[key] ?? 0)
			const hasAnyValue = breakfast?.[key] !== undefined || lunch?.[key] !== undefined || dinner?.[key] !== undefined
			return hasAnyValue ? sum : undefined
		}

		return {
			calories: getSum("calories"),
			protein: getSum("protein"),
			fat: getSum("fat"),
			carbs: getSum("carbs"),
			fiber: getSum("fiber"),
		}
	}, [formValues])

	const calculatedCalories = useMemo(() => {
		return calculateCaloriesFromMacros(dailyTotals.protein, dailyTotals.carbs, dailyTotals.fat)
	}, [dailyTotals.protein, dailyTotals.carbs, dailyTotals.fat])

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			await createOrUpdateGoal({ ...input, startDate: today })
			toast.success("Saved. Applies today and future days.")
		} catch (error: any) {
			toast.error(error?.message ?? "Failed to save goal.")
		}
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
			<div className="space-y-6">
				{entryUtil.mealTypes.map((mealType) => (
					<Card key={mealType}>
						<CardHeader>
							<CardTitle>{capitalize(mealType)} goals</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{config.macros.map((macro) => (
								<div key={`${mealType}-${macro}`} className="grid gap-1">
									<label htmlFor={`${mealType}-${macro}`} className="text-muted-foreground text-sm">
										{capitalize(macro)}
									</label>
									<Input
										{...form.register(`${mealType}.${macro}` as any, {
											setValueAs: (value) => {
												if (value === "" || value === null || value === undefined) {
													return undefined
												}
												const num = Number(value)
												return isNaN(num) ? undefined : num
											},
										})}
										id={`${mealType}-${macro}`}
										type="number"
									/>
									{macro === "calories" && (
										<div className="text-[10px] text-muted-foreground">
											{(() => {
												const meal = formValues[mealType as keyof typeof formValues] as
													| { protein?: number; carbs?: number; fat?: number }
													| undefined
												const calc = calculateCaloriesFromMacros(meal?.protein, meal?.carbs, meal?.fat)
												return calc !== undefined ? `Calculated: ${Math.round(calc)} Cal` : null
											})()}
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				))}

				<Card>
					<CardHeader>
						<CardTitle>Daily totals</CardTitle>
						<CardDescription>Sum of all meal goals</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
							<div className="grid gap-1">
								<div className="text-muted-foreground text-sm">Calories</div>
								<div className="font-mono text-lg">
									{dailyTotals.calories !== undefined ? Math.round(dailyTotals.calories) : "—"}
								</div>
								{calculatedCalories !== undefined &&
									dailyTotals.calories !== undefined &&
									Math.round(dailyTotals.calories) !== Math.round(calculatedCalories) && (
										<div className="text-[10px] text-muted-foreground">
											From macros: {Math.round(calculatedCalories)} Cal
										</div>
									)}
							</div>
							<div className="grid gap-1">
								<div className="text-muted-foreground text-sm">Protein</div>
								<div className="font-mono text-lg">
									{dailyTotals.protein !== undefined ? `${Math.round(dailyTotals.protein)}g` : "—"}
								</div>
							</div>
							<div className="grid gap-1">
								<div className="text-muted-foreground text-sm">Carbs</div>
								<div className="font-mono text-lg">
									{dailyTotals.carbs !== undefined ? `${Math.round(dailyTotals.carbs)}g` : "—"}
								</div>
							</div>
							<div className="grid gap-1">
								<div className="text-muted-foreground text-sm">Fat</div>
								<div className="font-mono text-lg">
									{dailyTotals.fat !== undefined ? `${Math.round(dailyTotals.fat)}g` : "—"}
								</div>
							</div>
							<div className="grid gap-1">
								<div className="text-muted-foreground text-sm">Fiber</div>
								<div className="font-mono text-lg">
									{dailyTotals.fiber !== undefined ? `${Math.round(dailyTotals.fiber)}g` : "—"}
								</div>
							</div>
							{calculatedCalories !== undefined && (
								<div className="grid gap-1">
									<div className="text-muted-foreground text-sm">Calculated Calories</div>
									<div className="font-mono text-lg text-blue-600 dark:text-blue-400">
										{Math.round(calculatedCalories)} Cal
									</div>
									<div className="text-[10px] text-muted-foreground">
										(Protein × 4 + Carbs × 4 + Fat × 9)
									</div>
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter className="justify-end pt-6">
						<Button type="submit" isLoading={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Saving…" : "Save all goals"}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</form>
	)
}

export default SettingsForm
