"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { createOrUpdateGoalSchema } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"

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
								</div>
							))}
						</CardContent>
					</Card>
				))}

				<Card>
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
