import { useMutation } from "convex/react"
import { parseISO } from "date-fns"
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { useState } from "react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import { api } from "@/convex/_generated/api"
import type { Entry, Food } from "@/convex/schema"
import { capitalize } from "@/utils/capitalize"
import { dateUtil } from "@/utils/date-util"
import { GLOBALS } from "@/utils/globals"
import { EditEntryDialog } from "./edit-entry-dialog"

type DropdownItem = "edit" | "delete" | "viewFood" | "viewEntry"

export const EntryItem = (props: { entry: Entry; food: Food; dropdownItems?: Partial<Record<DropdownItem, boolean>>; hideMealType?: boolean }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const removeEntry = useMutation(api.entries.remove)

	const qty = props.entry.quantity
	const calories = Math.round(props.food.calories * qty)
	const protein = Math.round(props.food.protein * qty)
	const carbs = Math.round(props.food.carbs * qty)
	const fat = Math.round(props.food.fat * qty)

	return (
		<>
			<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<button
						className="flex w-full cursor-pointer items-center gap-5 rounded-2xl border border-mono-300 bg-mono-200 p-3 text-left"
						onPointerDown={(e) => e.preventDefault()}
						onClick={() => setIsDropdownOpen((prev) => !prev)}
					>
						<Image src={GLOBALS.thiings(props.food.image)} width={50} height={50} alt="Food Image" className="scale-125" />

						<div className="min-w-0">
							<div className="truncate font-medium">
								{props.food.name}
								{props.food.brand && <span className="ml-1 text-muted-foreground text-sm">({props.food.brand})</span>}
							</div>
							<div className="space-x-2 text-muted-foreground text-xs">
								{[!props.hideMealType && capitalize(props.entry.mealType), `${props.food.servingSize * props.entry.quantity} ${props.food.servingUnit}`]
									.filter(Boolean)
									.map((str, i) => (
										<React.Fragment key={i}>
											<span key={i}>{str}</span>
											<span className="last:hidden">|</span>
										</React.Fragment>
									))}
							</div>
						</div>

						<div className="ml-auto shrink-0 text-right">
							<div className="font-mono font-semibold text-sm">{calories} Cal</div>
							<div className="text-[10px] text-muted-foreground">
								{protein}g P · {carbs}g C · {fat}g F
							</div>
						</div>
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] shadow-2xl">
					{props.dropdownItems?.edit && (
						<DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
							<PencilIcon className="mr-2" />
							Edit
						</DropdownMenuItem>
					)}

					{props.dropdownItems?.delete && (
						<DropdownMenuItem
							variant="destructive"
							onSelect={async () => {
								try {
									await removeEntry({ id: props.entry._id })
									toast.success("Entry deleted")
								} catch (error: any) {
									toast.error(error?.message ?? "Failed to delete entry")
								}
							}}
						>
							<Trash2Icon className="mr-2" />
							Delete
						</DropdownMenuItem>
					)}

					{(props.dropdownItems?.edit || props.dropdownItems?.delete) && (props.dropdownItems?.viewFood || props.dropdownItems?.viewEntry) && <DropdownMenuSeparator />}

					{props.dropdownItems?.viewFood && (
						<Link href={`/foods/${props.entry.foodId}`}>
							<DropdownMenuItem>
								<ExternalLinkIcon className="mr-2" />
								View Food
							</DropdownMenuItem>
						</Link>
					)}

					{props.dropdownItems?.viewEntry && (
						<Link href="/" onClick={() => dateUtil.store.setState({ selectedDate: parseISO(props.entry.entryDate) })}>
							<DropdownMenuItem>
								<ExternalLinkIcon className="mr-2" />
								View Entry
							</DropdownMenuItem>
						</Link>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<EditEntryDialog isOpen={isEditOpen} setIsOpen={setIsEditOpen} entry={props.entry} />
		</>
	)
}

export default EntryItem
