import { useQuery } from "convex/react"
import { format, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import React from "react"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { dateUtil } from "@/utils/date-util"

export const FoodEntries = (props: { food: Food }) => {
	const router = useRouter()
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
								<li
									key={entry._id}
									className="group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50"
									onClick={() => {
										dateUtil.store.setState({ selectedDate: parseISO(date) })
										router.push("/")
									}}
								>
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-muted-foreground text-sm">{entry.mealType.slice(0, 1).toUpperCase() + entry.mealType.slice(1)}</p>
											<p className="text-muted-foreground text-xs">
												{props.food.servingSize} {props.food.servingUnit} × {entry.quantity}
											</p>
										</div>
										<div className="text-right">
											<div className="font-mono font-semibold text-sm">{Math.round(props.food.calories * entry.quantity)} Cal</div>
											<div className="text-[10px] text-muted-foreground">
												{Math.round(props.food.protein * entry.quantity)}g P · {Math.round(props.food.carbs * entry.quantity)}g C ·{" "}
												{Math.round(props.food.fat * entry.quantity)}g F
											</div>
										</div>
									</div>
									{entry.note && <p className="mt-2 text-muted-foreground text-sm">{entry.note}</p>}
								</li>
							))}
						</React.Fragment>
					)
				})}
			</ul>
		</div>
	)
}

export default FoodEntries
