import { beforeEach, describe, expect, it, vi } from "vitest"
import { searchPublicFoodsAction } from "@/actions/food/search-public-foods-action"

global.fetch = vi.fn()

describe("searchPublicFoodsAction", () => {
	beforeEach(() => {
		vi.resetAllMocks()
		process.env.USDA_API_KEY = "test-api-key"
	})

	it("should throw error if USDA_API_KEY is not set", async () => {
		delete process.env.USDA_API_KEY

		await expect(searchPublicFoodsAction({ query: "chicken" })).rejects.toThrow("USDA_API_KEY environment variable is not set")
	})

	it("should return empty array for empty query", async () => {
		const result = await searchPublicFoodsAction({ query: "" })
		expect(result).toEqual({ foods: [] })
	})

	it("should return empty array for whitespace-only query", async () => {
		const result = await searchPublicFoodsAction({ query: "   " })
		expect(result).toEqual({ foods: [] })
	})

	it("should call USDA API with correct parameters", async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({
				foods: [
					{
						fdcId: 123,
						description: "Chicken Breast",
						foodNutrients: [
							{ name: "Energy", amount: 165 },
							{ name: "Protein", amount: 31 },
							{ name: "Total lipid (fat)", amount: 3.6 },
							{ name: "Carbohydrate, by difference", amount: 0 },
						],
					},
				],
			}),
		}

		vi.mocked(fetch).mockResolvedValue(mockResponse as any)

		await searchPublicFoodsAction({ query: "chicken" })

		expect(fetch).toHaveBeenCalledTimes(1)
		const fetchUrl = vi.mocked(fetch).mock.calls[0][0] as string
		expect(fetchUrl).toContain("api_key=test-api-key")
		expect(fetchUrl).toContain("query=chicken")
		expect(fetchUrl).toContain("pageSize=20")
		expect(fetchUrl).toContain("dataType=Foundation%2CBranded")
	})

	it("should map USDA response to food schema", async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({
				foods: [
					{
						fdcId: 123,
						description: "Chicken Breast",
						brandOwner: "Tyson",
						foodNutrients: [
							{ nutrientName: "Energy", value: 165 },
							{ nutrientName: "Protein", value: 31 },
							{ nutrientName: "Total lipid (fat)", value: 3.6 },
							{ nutrientName: "Carbohydrate, by difference", value: 0 },
							{ nutrientName: "Total dietary fiber", value: 0 },
							{ nutrientName: "Total Sugars", value: 0 },
						],
					},
				],
			}),
		}

		vi.mocked(fetch).mockResolvedValue(mockResponse as any)

		const result = await searchPublicFoodsAction({ query: "chicken" })

		expect(result.foods).toHaveLength(1)
		expect(result.foods[0]).toMatchObject({
			name: "Chicken Breast",
			brand: "Tyson",
			servingSize: 100,
			servingUnit: "g",
			calories: 165,
			protein: 31,
			fat: 3.6,
			carbs: 0,
			fiber: 0,
			sugar: 0,
		})
	})

	it("should filter out foods without macro data", async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({
				foods: [
					{
						fdcId: 123,
						description: "Food with macros",
						foodNutrients: [{ nutrientName: "Energy", value: 100 }],
					},
					{
						fdcId: 456,
						description: "Food without macros",
						foodNutrients: [],
					},
				],
			}),
		}

		vi.mocked(fetch).mockResolvedValue(mockResponse as any)

		const result = await searchPublicFoodsAction({ query: "test" })

		expect(result.foods).toHaveLength(1)
		expect(result.foods[0].name).toBe("Food with macros")
	})

	it("should handle USDA API errors", async () => {
		const mockResponse = {
			ok: false,
			status: 401,
			text: async () => "Unauthorized",
		}

		vi.mocked(fetch).mockResolvedValue(mockResponse as any)

		await expect(searchPublicFoodsAction({ query: "test" })).rejects.toThrow("USDA API error: 401")
	})

	it("should handle network errors", async () => {
		vi.mocked(fetch).mockRejectedValue(new Error("Network error"))

		await expect(searchPublicFoodsAction({ query: "test" })).rejects.toThrow("Failed to search foods: Network error")
	})

	it("should handle missing nutrient values gracefully", async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({
				foods: [
					{
						fdcId: 123,
						description: "Incomplete Food",
						foodNutrients: [
							{ nutrientName: "Energy", value: 100 },
							{ nutrientName: "Protein", value: 20 },
						],
					},
				],
			}),
		}

		vi.mocked(fetch).mockResolvedValue(mockResponse as any)

		const result = await searchPublicFoodsAction({ query: "test" })

		expect(result.foods[0]).toMatchObject({
			name: "Incomplete Food",
			calories: 100,
			protein: 20,
			fat: 0,
			carbs: 0,
			fiber: 0,
			sugar: 0,
		})
	})
})
