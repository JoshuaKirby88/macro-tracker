import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { type PublicFood, PublicFoodItem } from "@/components/food/public-food-item"

describe("PublicFoodItem", () => {
	it("should render food name and macros", () => {
		const food: PublicFood = {
			name: "Chicken Breast",
			servingSize: 100,
			servingUnit: "g",
			calories: 165,
			protein: 31,
			fat: 3.6,
			carbs: 0,
		}

		render(<PublicFoodItem food={food} />)

		expect(screen.getByText("Chicken Breast")).toBeInTheDocument()
		expect(screen.getByText("165")).toBeInTheDocument()
		expect(screen.getByText("31g")).toBeInTheDocument()
		expect(screen.getByText("4g")).toBeInTheDocument()
		expect(screen.getByText("0g")).toBeInTheDocument()
	})

	it("should render brand if provided", () => {
		const food: PublicFood = {
			name: "Greek Yogurt",
			brand: "Chobani",
			servingSize: 170,
			servingUnit: "g",
			calories: 100,
			protein: 17,
		}

		render(<PublicFoodItem food={food} />)

		expect(screen.getByText("Chobani")).toBeInTheDocument()
	})

	it("should render serving size information", () => {
		const food: PublicFood = {
			name: "Oatmeal",
			servingSize: 1,
			servingUnit: "cup",
			calories: 150,
			protein: 5,
			fat: 3,
			carbs: 27,
		}

		render(<PublicFoodItem food={food} />)

		expect(screen.getByText("1 cup")).toBeInTheDocument()
	})

	it("should handle missing optional fields", () => {
		const food: PublicFood = {
			name: "Apple",
			servingSize: 100,
			servingUnit: "g",
			calories: 52,
		}

		render(<PublicFoodItem food={food} />)

		expect(screen.getByText("Apple")).toBeInTheDocument()
		expect(screen.getByText("52")).toBeInTheDocument()
	})

	it("should round macro values", () => {
		const food: PublicFood = {
			name: "Salmon",
			servingSize: 100,
			servingUnit: "g",
			calories: 208,
			protein: 20.5,
			fat: 13.4,
			carbs: 0,
		}

		render(<PublicFoodItem food={food} />)

		expect(screen.getByText("21g")).toBeInTheDocument()
		expect(screen.getByText("13g")).toBeInTheDocument()
	})
})
