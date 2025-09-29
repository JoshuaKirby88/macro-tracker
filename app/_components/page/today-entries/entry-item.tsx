import { useMutation } from "convex/react"
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import { api } from "@/convex/_generated/api"
import type { Entry, Food } from "@/convex/schema"
import { GLOBALS } from "@/utils/globals"
import { EditEntryDialog } from "./edit-entry-dialog"

type Props = {
	entry: Entry
	food: Food
	className?: string
}

export const EntryItem = ({ entry, food, className }: Props) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const removeEntry = useMutation(api.entries.remove)

	const qty = entry.quantity
	const calories = Math.round(food.calories * qty)
	const protein = Math.round(food.protein * qty)
	const carbs = Math.round(food.carbs * qty)
	const fat = Math.round(food.fat * qty)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className={`flex w-full items-center gap-5 rounded-md border p-3 text-left ${className ?? ""}`}>
						<div className="flex min-w-0 flex-1 items-center gap-5">
							<Image src={GLOBALS.thiings(food.image)} width={50} height={50} alt="Food Image" />

							<div className="min-w-0">
								<div className="truncate font-medium">
									{food.name}
									{food.brand && <span className="ml-1 text-muted-foreground text-sm">({food.brand})</span>}
								</div>
								<div className="text-muted-foreground text-xs">
									{food.servingSize * entry.quantity} {food.servingUnit}
								</div>
							</div>

							<div className="ml-auto shrink-0 text-right">
								<div className="font-mono font-semibold text-sm">{calories} Cal</div>
								<div className="text-[10px] text-muted-foreground">
									{protein}g P · {carbs}g C · {fat}g F
								</div>
							</div>
						</div>
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<Link href={`/foods/${entry.foodId}`}>
						<DropdownMenuItem>
							<ExternalLinkIcon className="mr-2" />
							View Food
						</DropdownMenuItem>
					</Link>

					<DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
						<PencilIcon className="mr-2" />
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
						<Trash2Icon className="mr-2" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditEntryDialog isOpen={isEditOpen} setIsOpen={setIsEditOpen} entry={entry} />
		</>
	)
}

export default EntryItem
