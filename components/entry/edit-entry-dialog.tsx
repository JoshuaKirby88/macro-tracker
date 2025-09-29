import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { Button } from "@/components/shadcn/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { api } from "@/convex/_generated/api"
import { type Entry, updateEntrySchema } from "@/convex/schema"
import { entryUtil } from "@/utils/entry-util"
import { toastFormError } from "@/utils/form/toast-form-error"
import { FormNumberInput } from "../form-number-input"
import { Label } from "../shadcn/label"

export const EditEntryDialog = (props: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; entry: Entry }) => {
	const updateEntry = useMutation(api.entries.update)
	const form = useForm({ resolver: zodResolver(updateEntrySchema), defaultValues: props.entry })

	const onSubmit = async (input: z.infer<typeof updateEntrySchema>) => {
		try {
			await updateEntry({ id: props.entry._id, ...input })
			toast.success("Entry updated")
			props.setIsOpen(false)
		} catch (error: any) {
			toast.error(error?.message ?? "Failed to update entry")
		}
	}

	return (
		<Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
			<DialogContent className="w-[30rem] max-w-[95%]">
				<DialogHeader>
					<DialogTitle>Edit entry</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit, toastFormError)} className="grid gap-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="grid gap-1">
							<Label className="text-muted-foreground text-sm">Quantity</Label>
							<FormNumberInput form={form} value="quantity" />
						</div>

						<div className="grid gap-1">
							<label htmlFor="edit-mealType" className="text-muted-foreground text-sm">
								Meal
							</label>
							<Controller
								control={form.control}
								name="mealType"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
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
								)}
							/>
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
	)
}
