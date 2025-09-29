"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { FoodForm } from "@/components/food/food-form/food-form"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { FoodEntries } from "./food-entries"

export const FoodDetails = () => {
	const params = useParams<{ foodId: Food["_id"] }>()
	const food = useQuery(api.foods.byId, { id: params.foodId })

	if (food === undefined) {
		return <p className="text-muted-foreground">Loading…</p>
	} else if (food === null) {
		return <p className="text-destructive">Food not found.</p>
	} else {
		return (
			<>
				<FoodForm type="update" food={food} />
				<FoodEntries food={food} />
			</>
		)
	}
}
