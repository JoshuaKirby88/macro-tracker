import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const forUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return []

		const foods = await ctx.db
			.query("food")
			.withIndex("byUserId", (q) => q.eq("userId", identity.subject))
			.collect()

		return foods
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		image: v.string(),
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
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const now = Date.now()

		const insertedId = await ctx.db.insert("food", {
			userId: identity.subject,
			name: args.name.trim(),
			image: args.image.trim(),
			brand: args.brand?.trim(),
			description: args.description?.trim(),
			servingSize: args.servingSize,
			servingUnit: args.servingUnit.trim(),
			calories: args.calories,
			protein: args.protein,
			fat: args.fat,
			carbs: args.carbs,
			sugar: args.sugar,
			fiber: args.fiber,
			createdAt: now,
			updatedAt: now,
		})

		return insertedId
	},
})
