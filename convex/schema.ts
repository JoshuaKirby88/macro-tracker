import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	food: defineTable({
		// Clerk user id tying this record to a user
		userId: v.string(),

		// Identity
		name: v.string(),
		brand: v.optional(v.string()),
		description: v.optional(v.string()),

		// Serving information (macros are per serving)
		servingSize: v.number(), // e.g., 100
		servingUnit: v.string(), // e.g., "g", "ml", "piece"

		// Core macros
		calories: v.number(),
		protein: v.number(),
		fat: v.number(),
		carbs: v.number(),
		sugar: v.number(),
		fiber: v.optional(v.number()),

		// Timestamps (ms since epoch)
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId"]) // list foods for a user
		.index("by_user_name", ["userId", "name"]) // search by name per user
		.index("by_user_createdAt", ["userId", "createdAt"]),

	entry: defineTable({
		// Ownership
		userId: v.string(), // Clerk user id

		// Link to food
		foodId: v.id("food"),

		// Logging details
		quantity: v.number(), // multiplier of food's serving
		loggedAt: v.number(), // when the entry was consumed/logged (ms)
		mealType: v.optional(v.string()), // e.g., breakfast, lunch, dinner, snack
		note: v.optional(v.string()),

		// Timestamps (ms since epoch)
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId"]) // list entries for a user
		.index("by_user_loggedAt", ["userId", "loggedAt"]) // timeline per user
		.index("by_user_food", ["userId", "foodId"]) // entries per user+food
		.index("by_food_loggedAt", ["foodId", "loggedAt"]),

	goal: defineTable({
		// Ownership
		userId: v.string(),

		// Versioning: goal becomes effective on this day (YYYY-MM-DD)
		startsOn: v.string(),

		// Optional daily macro goals
		calories: v.optional(v.number()),
		protein: v.optional(v.number()),
		fat: v.optional(v.number()),
		carbs: v.optional(v.number()),

		// Timestamps (ms since epoch)
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		// Fetch latest goal whose startsOn <= target day
		.index("by_user_startsOn", ["userId", "startsOn"])
		.index("by_user_updatedAt", ["userId", "updatedAt"]),
})
