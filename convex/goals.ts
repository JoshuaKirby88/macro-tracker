import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Get the most recent goal effective on or before a given date (YYYY-MM-DD)
export const getForDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const goal = await ctx.db
			.query("goal")
			.withIndex("by_user_startsOn", (q) => q.eq("userId", identity.subject).lte("startsOn", args.forDate))
			.order("desc")
			.first()

		return goal ?? null
	},
})

// Create or update the goal that starts on the given date (YYYY-MM-DD).
// If a goal already exists that starts on this date, update it.
// Otherwise, insert a new record effective on this date, leaving history intact.
export const upsertForDate = mutation({
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
			return existing._id
		}

		const insertedId = await ctx.db.insert("goal", {
			userId: identity.subject,
			startsOn: args.forDate,
			calories: args.calories,
			protein: args.protein,
			fat: args.fat,
			carbs: args.carbs,
			createdAt: now,
			updatedAt: now,
		})

		return insertedId
	},
})
