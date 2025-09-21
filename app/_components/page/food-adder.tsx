"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { PenIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { FoodCommand } from "@/components/food-command"
import { Button, buttonVariants } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"
import { Input } from "@/components/shadcn/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import { createEntrySchema } from "@/convex/schema"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	schema: createEntrySchema.omit({ entryDate: true }),
}

export const FoodAdder = () => {
	const createEntry = useMutation(api.entries.create)
	const form = useForm({ resolver: zodResolver(config.schema), defaultValues: { mealType: "breakfast", quantity: 1 } })
	const selectedFoodId = form.watch("foodId")

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			await createEntry({ ...input, entryDate: dateUtil.getDateString(new Date()) })
			toast.success("Added to today's entries")
			form.reset()
		} catch (error: any) {
			toast.error(error?.message ?? "Something went wrong")
		}
	}

	return (
		<Card className="-translate-x-1/2 fixed bottom-10 left-1/2 w-[30rem] max-w-[95%] flex-row p-4">
			<form onSubmit={form.handleSubmit(onSubmit, toastFormError)} className="grid w-full gap-3">
				<div className="flex gap-4">
					<Controller name="foodId" control={form.control} render={({ field }) => <FoodCommand foodId={field.value} onChange={field.onChange} />} />

					<Link href="/foods" className={buttonVariants({ variant: "outline", size: "icon", className: "ml-auto" })}>
						<PenIcon />
					</Link>

					<Link href="/create" className={buttonVariants({ variant: "outline", size: "icon" })}>
						<PlusIcon />
					</Link>
				</div>

				<div className={`grid grid-cols-3 items-end gap-2 ${!selectedFoodId ? "hidden" : ""}`}>
					<div className="grid gap-1">
						<span className="text-muted-foreground text-sm">Quantity</span>
						<Input {...form.register("quantity", { valueAsNumber: true })} />
					</div>

					<div className="grid gap-1">
						<span className="text-muted-foreground text-sm">Meal</span>
						<Select {...form.register("mealType")}>
							<SelectTrigger className="w-full capitalize">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{entryUtil.mealTypes.map((mealType) => (
									<SelectItem key={mealType} value={mealType} className="capitalize">
										{mealType}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button type="submit" isLoading={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? "Tracking…" : "Track"}
					</Button>
				</div>
			</form>
		</Card>
	)
}
