import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// List foods for the authenticated user, sorted by name
export const listForUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		// Return empty list if not signed in to keep client simple
		if (!identity) return []

		const foods = await ctx.db
			.query("food")
			.withIndex("by_user_name", (q) => q.eq("userId", identity.subject))
			.collect()

		return foods
	},
})

// Create a new food for the authenticated user
export const create = mutation({
	args: {
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
		fiber: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const now = Date.now()
		const insertedId = await ctx.db.insert("food", {
			userId: identity.subject,
			name: args.name.trim(),
			brand: args.brand?.trim(),
			description: args.description?.trim(),
			servingSize: args.servingSize,
			servingUnit: args.servingUnit.trim(),
			calories: args.calories,
			protein: args.protein,
			fat: args.fat,
			carbs: args.carbs,
			sugar: args.sugar,
			fiber: typeof args.fiber === "number" ? args.fiber : undefined,
			createdAt: now,
			updatedAt: now,
		})

		return insertedId
	},
})
