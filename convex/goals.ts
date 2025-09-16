import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const forDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const goal = await ctx.db
			.query("goal")
			.withIndex("by_user_startsOn", (q) => q.eq("userId", identity.subject).lte("startsOn", args.forDate))
			.order("desc")
			.first()

		return goal
	},
})

export const createOrUpdate = mutation({
	args: {
		forDate: v.string(),
		calories: v.optional(v.number()),
		protein: v.optional(v.number()),
		fat: v.optional(v.number()),
		carbs: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const now = Date.now()

		const existing = await ctx.db
			.query("goal")
			.withIndex("by_user_startsOn", (q) => q.eq("userId", identity.subject).eq("startsOn", args.forDate))
			.first()

		if (existing) {
			await ctx.db.patch(existing._id, {
				calories: args.calories,
				protein: args.protein,
				fat: args.fat,
				carbs: args.carbs,
				updatedAt: now,
			})
		} else {
			await ctx.db.insert("goal", {
				userId: identity.subject,
				startsOn: args.forDate,
				calories: args.calories,
				protein: args.protein,
				fat: args.fat,
				carbs: args.carbs,
				createdAt: now,
				updatedAt: now,
			})
		}
	},
})
