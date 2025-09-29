import { useQuery } from "convex/react"
import { format, parseISO } from "date-fns"
import React from "react"
import EntryItem from "@/components/entry/entry-item"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"

export const FoodEntries = (props: { food: Food }) => {
	const entries = useQuery(api.entries.byFoodId, { foodId: props.food._id })
	const dates = Array.from(new Set((entries ?? []).map((entry) => entry.entryDate))).sort((a, b) => b.localeCompare(a))

	return (
		<div className="my-8">
			<h2 className="font-bold text-2xl">Entries</h2>
			<ul className="mt-4 space-y-4">
				{dates.map((date) => {
					const filteredEntries = entries?.filter((e) => e.entryDate === date)

					return (
						<React.Fragment key={date}>
							<li key={date} className="ml-4 list-disc font-medium text-muted-foreground text-sm">
								{format(parseISO(date), "EEE, MMM d, yyyy")}
							</li>

							{filteredEntries?.map((entry) => (
								<EntryItem key={entry._id} food={props.food} entry={entry} dropdownItems={{ edit: true, delete: true, viewEntry: true }} />
							))}
						</React.Fragment>
					)
				})}
			</ul>
		</div>
	)
}

export default FoodEntries
