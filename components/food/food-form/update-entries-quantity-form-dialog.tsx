import { useMutation } from "convex/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/shadcn/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"

export const UpdateEntriesQuantityFormDialog = (props: { food: Food; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; servingSizeDelta: { prev: number; next: number } | null }) => {
	const updateQuantitiesForFood = useMutation(api.foods.updateQuantitiesForFood)
	const form = useForm()

	const onSubmit = async () => {
		if (!props.servingSizeDelta) return
		try {
			await updateQuantitiesForFood({
				foodId: props.food._id,
				previousServingSize: props.servingSizeDelta.prev,
				nextServingSize: props.servingSizeDelta.next,
			})
			toast.success("Saved and updated entries")
			props.setIsOpen(false)
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Something went wrong")
		}
	}

	return (
		<Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
			<DialogContent className="w-[30rem] max-w-[95%]">
				<DialogHeader>
					<DialogTitle>Update entries?</DialogTitle>
					<DialogDescription>
						You changed the serving size from {props.servingSizeDelta?.prev} to {props.servingSizeDelta?.next}. Do you want to update the quantities of all entries for this food so that
						quantity × servingSize stays the same?
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<DialogFooter>
						<Button variant="secondary" disabled={form.formState.isSubmitting}>
							Dismiss
						</Button>
						<Button type="submit" isLoading={form.formState.isSubmitting}>
							Update all entry quantity
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
