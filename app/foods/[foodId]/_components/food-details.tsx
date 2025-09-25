"use client"

import { type Preloaded, usePreloadedQuery } from "convex/react"
import type { api } from "@/convex/_generated/api"
import { FoodForm } from "./food-form"

export const FoodDetails = (props: { preloadedFood: Preloaded<typeof api.foods.byId> }) => {
	const food = usePreloadedQuery(props.preloadedFood)

	if (food === undefined) {
		return <p className="text-muted-foreground">Loading…</p>
	}
	if (food === null) {
		return <p className="text-destructive">Food not found.</p>
	}
	return <FoodForm food={food} />
}

export default FoodDetails
