import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const forDate = query({
	args: { date: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const goal = await ctx.db
			.query("goal")
			.withIndex("byUserIdStartDate", (q) => q.eq("userId", identity.subject).lte("startDate", args.date))
			.order("desc")
			.first()

		return goal
	},
})

export const createOrUpdate = mutation({
	args: {
		date: v.string(),
		calories: v.optional(v.number()),
		protein: v.optional(v.number()),
		fat: v.optional(v.number()),
		carbs: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await ctx.db
			.query("goal")
			.withIndex("byUserIdStartDate", (q) => q.eq("userId", identity.subject).eq("startDate", args.date))
			.first()

		const now = Date.now()

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
				startDate: args.date,
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
