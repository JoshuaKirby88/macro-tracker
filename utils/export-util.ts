import type { Entry, Food } from "@/convex/schema"
import { format } from "date-fns"

export type NutritionField = "calories" | "protein" | "fat" | "carbs" | "sugar" | "fiber"

export const nutritionLabels: Record<NutritionField, string> = {
	calories: "Calories",
	protein: "Protein",
	fat: "Fat",
	carbs: "Carbs",
	sugar: "Sugar",
	fiber: "Fiber",
}

export const exportUtil = {
	nutritionLabels,
	generateMarkdown(input: {
		entries: Entry[]
		foods: Food[]
		selectedMeals: Entry["mealType"][]
		selectedNutrition: NutritionField[]
	}): string {
		const { entries, foods, selectedMeals, selectedNutrition } = input

		// Filter entries by selected meals
		const filteredEntries = entries.filter((entry) => selectedMeals.includes(entry.mealType))

		if (filteredEntries.length === 0) {
			return "# Food Export\n\nNo entries found for the selected criteria."
		}

		// Group entries by date
		const entriesByDate = new Map<string, Entry[]>()
		for (const entry of filteredEntries) {
			const dateEntries = entriesByDate.get(entry.entryDate) || []
			dateEntries.push(entry)
			entriesByDate.set(entry.entryDate, dateEntries)
		}

		// Sort dates
		const sortedDates = Array.from(entriesByDate.keys()).sort()

		let markdown = "# Food Export\n\n"
		const startDateFormatted = format(new Date(sortedDates[0] + "T00:00:00"), "MMMM d, yyyy")
		const endDateFormatted = format(new Date(sortedDates[sortedDates.length - 1] + "T00:00:00"), "MMMM d, yyyy")
		if (sortedDates.length === 1 || sortedDates[0] === sortedDates[sortedDates.length - 1]) {
			markdown += `**Date:** ${startDateFormatted}\n\n`
		} else {
			markdown += `**Date Range:** ${startDateFormatted} - ${endDateFormatted}\n\n`
		}
		markdown += `**Meals:** ${selectedMeals.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}\n\n`
		markdown += `**Nutritional Information:** ${selectedNutrition.map((n) => nutritionLabels[n]).join(", ")}\n\n`
		markdown += "---\n\n"

		// Generate content for each date
		for (const date of sortedDates) {
			const dateEntries = entriesByDate.get(date)!
			const formattedDate = format(new Date(date + "T00:00:00"), "EEEE, MMMM d, yyyy")

			markdown += `## ${formattedDate}\n\n`

			// Group by meal type
			const mealTypes: Entry["mealType"][] = ["breakfast", "lunch", "dinner"]
			for (const mealType of mealTypes) {
				const mealEntries = dateEntries.filter((e) => e.mealType === mealType)
				if (mealEntries.length === 0) continue

				markdown += `### ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}\n\n`

				// Calculate totals for this meal
				const mealTotals: Record<NutritionField, number> = {
					calories: 0,
					protein: 0,
					fat: 0,
					carbs: 0,
					sugar: 0,
					fiber: 0,
				}

				for (const entry of mealEntries) {
					const food = foods.find((f) => f._id === entry.foodId)
					if (!food) continue

					const qty = entry.quantity
					mealTotals.calories += food.calories * qty
					mealTotals.protein += food.protein * qty
					mealTotals.fat += food.fat * qty
					mealTotals.carbs += food.carbs * qty
					mealTotals.sugar += food.sugar * qty
					mealTotals.fiber += (food.fiber || 0) * qty

					// Food name without brand
					const foodName = food.name
					// Convert quantity * servingSize to total amount
					const totalAmount = entry.quantity * food.servingSize
					const servingInfo = `${Math.round(totalAmount)}${food.servingUnit}`

					markdown += `- **${foodName}** - ${servingInfo}`

					// Add nutritional info
					const nutritionParts: string[] = []
					for (const field of selectedNutrition) {
						const value = food[field] * entry.quantity
						const unit = field === "calories" ? "Cal" : "g"
						nutritionParts.push(`${Math.round(value)}${unit} ${nutritionLabels[field]}`)
					}

					if (nutritionParts.length > 0) {
						markdown += ` (${nutritionParts.join(", ")})`
					}

					if (entry.note) {
						markdown += `\n  - Note: ${entry.note}`
					}

					markdown += "\n"
				}

				// Add meal totals
				if (selectedNutrition.length > 0) {
					markdown += "\n**Totals:** "
					const totalParts: string[] = []
					for (const field of selectedNutrition) {
						const value = mealTotals[field]
						const unit = field === "calories" ? "Cal" : "g"
						totalParts.push(`${Math.round(value)}${unit} ${nutritionLabels[field]}`)
					}
					markdown += totalParts.join(", ")
					markdown += "\n\n"
				} else {
					markdown += "\n"
				}
			}

			// Add daily totals
			if (selectedNutrition.length > 0) {
				const dailyTotals: Record<NutritionField, number> = {
					calories: 0,
					protein: 0,
					fat: 0,
					carbs: 0,
					sugar: 0,
					fiber: 0,
				}

				for (const entry of dateEntries) {
					const food = foods.find((f) => f._id === entry.foodId)
					if (!food) continue
					const qty = entry.quantity
					dailyTotals.calories += food.calories * qty
					dailyTotals.protein += food.protein * qty
					dailyTotals.fat += food.fat * qty
					dailyTotals.carbs += food.carbs * qty
					dailyTotals.sugar += food.sugar * qty
					dailyTotals.fiber += (food.fiber || 0) * qty
				}

				markdown += "**Daily Totals:** "
				const totalParts: string[] = []
				for (const field of selectedNutrition) {
					const value = dailyTotals[field]
					const unit = field === "calories" ? "Cal" : "g"
					totalParts.push(`${Math.round(value)}${unit} ${nutritionLabels[field]}`)
				}
				markdown += totalParts.join(", ")
				markdown += "\n\n"
			}

			markdown += "---\n\n"
		}

		return markdown.trim()
	},
}
