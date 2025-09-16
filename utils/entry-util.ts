import type { Entry, Food } from "./convex-types"

export const entryUtil = {
	mealTypes: ["breakfast", "lunch", "dinner"] as const,
	getTotals(input: { entries: Entry[]; foods: Food[] }) {
		const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 }

		for (const entry of input.entries) {
			const food = input.foods.find((f) => f?._id === entry.foodId)
			if (!food) continue
			totals.calories += food.calories * entry.quantity
			totals.protein += food.protein * entry.quantity
			totals.fat += food.fat * entry.quantity
			totals.carbs += food.carbs * entry.quantity
			totals.sugar += food.sugar * entry.quantity
			totals.fiber += (food.fiber || 0) * entry.quantity
		}

		return totals
	},
}
