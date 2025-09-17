"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { capitalize } from "@/utils/capitalize"
import { dateUtil } from "@/utils/date-util"

const config = {
	schema: z.object({ calories: z.number().optional(), protein: z.number().optional(), fat: z.number().optional(), carbs: z.number().optional() }),
	macros: ["calories", "protein", "fat", "carbs"] as const,
}

const Page = () => {
	const today = dateUtil.getDateString(new Date())
	const goal = useQuery(api.goals.forDate, { date: today })
	const createOrUpdateGoal = useMutation(api.goals.createOrUpdate)
	const form = useForm<z.infer<typeof config.schema>>({ resolver: zodResolver(config.schema), defaultValues: goal ?? undefined })

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			await createOrUpdateGoal({ date: today, ...input })
			toast.success("Saved. Applies today and future days.")
		} catch (err: any) {
			toast.error(err?.message ?? "Failed to save goal.")
		}
	}

	return (
		<Card className="mx-auto w-[50rem] max-w-[95%]">
			<CardHeader>
				<CardTitle>Daily macro goals</CardTitle>
			</CardHeader>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{config.macros.map((macro) => (
						<div key={macro} className="grid gap-1">
							<label htmlFor={macro} className="text-muted-foreground text-sm">
								{capitalize(macro)}
							</label>
							<Input type="number" {...form.register(macro)} />
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

export default Page
