"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { MoreVertical } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import { Input } from "@/components/shadcn/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import { createEntrySchema, type Entry } from "@/convex/schema"
import { cn } from "@/utils/cn"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	schema: createEntrySchema.pick({ quantity: true, mealType: true }),
}

export const TodayEntries = () => {
	const today = dateUtil.getDateString(new Date())
	const entriesWithFoods = useQuery(api.entries.withFoodsForDate, { date: today })

	const updateEntry = useMutation(api.entries.update)
	const removeEntry = useMutation(api.entries.remove)

	const [editOpen, setEditOpen] = useState(false)
	const [editing, setEditing] = useState<Entry | null>(null)

	const form = useForm<z.infer<typeof config.schema>>({ resolver: zodResolver(config.schema), defaultValues: { quantity: 1, mealType: "breakfast" } })

	useEffect(() => {
		if (editing) {
			form.reset({ quantity: editing.quantity, mealType: editing.mealType })
		}
	}, [editing, form])

	const onEditSubmit = async (input: { quantity: number; mealType: (typeof entryUtil.mealTypes)[number] }) => {
		if (!editing) return
		try {
			await updateEntry({
				id: editing._id,
				foodId: editing.foodId,
				quantity: input.quantity,
				entryDate: editing.entryDate,
				mealType: input.mealType,
				note: editing.note,
			})
			toast.success("Entry updated")
			setEditOpen(false)
			setEditing(null)
		} catch (error: any) {
			toast.error(error?.message ?? "Failed to update entry")
		}
	}

	if (!entriesWithFoods) return null

	if (!entriesWithFoods.entries.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Today’s entries</CardTitle>
					<CardDescription>Food you have logged today by meal.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground text-sm">No entries yet today.</div>
				</CardContent>
			</Card>
		)
	}

	const mealsWithEntries = entryUtil.mealTypes
		.map((mealType) => ({
			mealType,
			entries: entriesWithFoods.entries.filter((entry) => entry.mealType === mealType),
		}))
		.filter((section) => section.entries.length > 0)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Today’s entries</CardTitle>
			</CardHeader>

			<CardContent className={cn("grid items-start gap-6", mealsWithEntries.length === 1 ? "grid-cols-1" : mealsWithEntries.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
				{mealsWithEntries.map(({ mealType, entries }) => (
					<div key={mealType} className="grid min-w-0 gap-3">
						<div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{mealType}</div>

						<div className="grid items-start gap-2">
							{entries.map((entry) => {
								const food = entriesWithFoods.foods.find((f) => f._id === entry.foodId)
								if (!food) return null

								return (
									<div key={entry._id} className="flex items-center gap-5 rounded-md border p-3">
										<Image src={`https://thiings.joshuakirby.webcam/${food.image}`} width={50} height={50} alt="Food Image" />
										<div className="min-w-0">
											<div className="truncate font-medium">
												{food.name}
												{food.brand && <span className="ml-1 text-muted-foreground text-sm">({food.brand})</span>}
											</div>
											<div className="text-muted-foreground text-xs">
												{food.servingSize} × {entry.quantity}
											</div>
										</div>
										<div className="ml-auto shrink-0 text-right">
											<div className="font-mono font-semibold text-sm">{Math.round(food.calories * entry.quantity)} kcal</div>
											<div className="text-[10px] text-muted-foreground">
												{Math.round(food.protein * entry.quantity)}g P · {Math.round(food.carbs * entry.quantity)}g C · {Math.round(food.fat * entry.quantity)}g F
											</div>
										</div>
										<div className="shrink-0">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" aria-label="Entry actions">
														<MoreVertical />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onSelect={() => {
															setEditing(entry)
															setEditOpen(true)
														}}
													>
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														onSelect={async () => {
															try {
																await removeEntry({ id: entry._id })
																toast.success("Entry deleted")
															} catch (error: any) {
																toast.error(error?.message ?? "Failed to delete entry")
															}
														}}
													>
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				))}
			</CardContent>

			<Dialog
				open={editOpen}
				onOpenChange={(o) => {
					setEditOpen(o)
					if (!o) setEditing(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit entry</DialogTitle>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(onEditSubmit, toastFormError)} className="grid gap-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="grid gap-1">
								<label htmlFor="edit-quantity" className="text-muted-foreground text-sm">
									Quantity
								</label>
								<Input id="edit-quantity" type="number" {...form.register("quantity", { valueAsNumber: true })} />
							</div>

							<div className="grid gap-1">
								<label htmlFor="edit-mealType" className="text-muted-foreground text-sm">
									Meal
								</label>
								<Select {...form.register("mealType")}>
									<SelectTrigger id="edit-mealType" className="w-full capitalize">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{entryUtil.mealTypes.map((m) => (
											<SelectItem key={m} value={m} className="capitalize">
												{m}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button type="submit" isLoading={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving…" : "Save changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	)
}
