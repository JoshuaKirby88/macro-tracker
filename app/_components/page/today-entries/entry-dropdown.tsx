import { useMutation } from "convex/react"
import { ExternalLinkIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/shadcn/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import { api } from "@/convex/_generated/api"
import type { Entry } from "@/convex/schema"
import { EditEntryDialog } from "./edit-entry-dialog"

export const EntryDropdown = (props: { entry: Entry }) => {
	const [isOpen, setIsOpen] = useState(false)
	const removeEntry = useMutation(api.entries.remove)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<MoreVerticalIcon />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => setIsOpen(true)}>
						<PencilIcon className="mr-2" />
						Edit
					</DropdownMenuItem>

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

					<DropdownMenuSeparator />

					<Link href={`/foods/${props.entry.foodId}`}>
						<DropdownMenuItem>
							<ExternalLinkIcon className="mr-2" />
							Edit Food
						</DropdownMenuItem>
					</Link>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditEntryDialog isOpen={isOpen} setIsOpen={setIsOpen} entry={props.entry} />
		</>
	)
}
