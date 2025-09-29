"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { FoodEntries } from "./food-entries"
import { FoodForm } from "./food-form"

export const FoodDetails = () => {
	const params = useParams<{ foodId: Food["_id"] }>()
	const food = useQuery(api.foods.byId, { id: params.foodId })

	if (food === undefined) {
		return <p className="text-muted-foreground">Loading…</p>
	}
	if (food === null) {
		return <p className="text-destructive">Food not found.</p>
	}
	return (
		<>
			<FoodForm food={food} />
			<FoodEntries food={food} />
		</>
	)
}

export default FoodDetails
