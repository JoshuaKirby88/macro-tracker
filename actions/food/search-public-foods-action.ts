"use server"

import type { createFoodSchema } from "@/convex/schema"

const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

interface USDFANutrient {
	nutrientName: string
	value: number
	unitName: string
}

interface USDFASearchResult {
	fdcId: number
	description: string
	brandOwner?: string
	foodNutrients: USDFANutrient[]
}

interface USDFASearchResponse {
	foods: USDFASearchResult[]
}

function getNutrientValue(food: USDFASearchResult, nutrientName: string): number {
	const nutrient = food.foodNutrients.find((n) => n.nutrientName === nutrientName)
	return nutrient?.value ?? 0
}

function mapUSDFAToFoodSchema(food: USDFASearchResult): Partial<ReturnType<(typeof createFoodSchema)["parse"]>> {
	return {
		name: food.description,
		brand: food.brandOwner,
		servingSize: 100,
		servingUnit: "g",
		calories: getNutrientValue(food, "Energy"),
		protein: getNutrientValue(food, "Protein"),
		fat: getNutrientValue(food, "Total lipid (fat)"),
		carbs: getNutrientValue(food, "Carbohydrate, by difference"),
		fiber: getNutrientValue(food, "Total dietary fiber"),
		sugar: getNutrientValue(food, "Total Sugars"),
	}
}

export async function searchPublicFoodsAction(input: { query: string }) {
	const apiKey = process.env.USDA_API_KEY
	if (!apiKey) {
		throw new Error("USDA_API_KEY environment variable is not set")
	}

	const query = input.query.trim()
	if (!query) {
		return { foods: [] }
	}

	try {
		const searchUrl = new URL(USDA_API_URL)
		searchUrl.searchParams.set("api_key", apiKey)
		searchUrl.searchParams.set("query", query)
		searchUrl.searchParams.set("pageSize", "20")
		searchUrl.searchParams.set("dataType", "Foundation,Branded")

		const response = await fetch(searchUrl.toString(), {
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`USDA API error: ${response.status} - ${errorText}`)
		}

		const data: USDFASearchResponse = await response.json()

		const foods = data.foods.map(mapUSDFAToFoodSchema).filter((food) => {
			const hasMacroData = (food.calories ?? 0) > 0 || (food.protein ?? 0) > 0 || (food.fat ?? 0) > 0 || (food.carbs ?? 0) > 0
			return hasMacroData
		})

		return { foods }
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to search foods: ${error.message}`)
		}
		throw new Error("Failed to search foods: Unknown error")
	}
}
