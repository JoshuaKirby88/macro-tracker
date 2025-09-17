import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	food: defineTable({
		userId: v.string(),
		name: v.string(),
		brand: v.optional(v.string()),
		description: v.optional(v.string()),
		servingSize: v.number(),
		servingUnit: v.string(),
		calories: v.number(),
		protein: v.number(),
		fat: v.number(),
		carbs: v.number(),
		sugar: v.number(),
		fiber: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("byUserId", ["userId", "name"]),

	entry: defineTable({
		userId: v.string(),
		foodId: v.id("food"),
		quantity: v.number(),
		entryDate: v.string(),
		mealType: v.optional(v.string()),
		note: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("byUserIdEntryDate", ["userId", "entryDate"]),

	goal: defineTable({
		userId: v.string(),
		startDate: v.string(),
		calories: v.optional(v.number()),
		protein: v.optional(v.number()),
		fat: v.optional(v.number()),
		carbs: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("byUserIdStartDate", ["userId", "startDate"]),
})
