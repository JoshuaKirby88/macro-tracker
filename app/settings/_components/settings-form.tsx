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
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	schema: createOrUpdateGoalSchema.omit({ startDate: true }),
	macros: ["calories", "protein", "fat", "carbs"] as const,
}

export const SettingsForm = () => {
	const today = dateUtil.getDateString(new Date())
	const goal = useQuery(api.goals.forDate, { date: today })
	const createOrUpdateGoal = useMutation(api.goals.createOrUpdate)
	const form = useForm({ resolver: zodResolver(config.schema), defaultValues: goal ?? undefined })

	useEffect(() => {
		if (goal) form.reset(goal)
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
		<Card>
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
			</CardHeader>

			<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
				<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{config.macros.map((macro) => (
						<div key={macro} className="grid gap-1">
							<label htmlFor={macro} className="text-muted-foreground text-sm">
								{capitalize(macro)}
							</label>
							<Input {...form.register(macro, { valueAsNumber: true })} />
						</div>
					))}
				</CardContent>

				<CardFooter className="justify-end">
					<Button type="submit" isLoading={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? "Saving…" : "Save goals"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

export default SettingsForm
