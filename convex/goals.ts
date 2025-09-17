import { v } from "convex/values"
import { zodOutputToConvex } from "convex-helpers/server/zod"
import { mutation, query } from "./_generated/server"
import { createOrUpdateGoalSchema } from "./schema"

export const createOrUpdate = mutation({
	args: zodOutputToConvex(createOrUpdateGoalSchema),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await ctx.db
			.query("goal")
			.withIndex("byUserIdStartDate", (q) => q.eq("userId", identity.subject).eq("startDate", args.startDate))
			.first()

		const now = Date.now()

		if (existing) {
			await ctx.db.patch(existing._id, {
				updatedAt: now,
				...args,
			})
		} else {
			await ctx.db.insert("goal", {
				userId: identity.subject,
				createdAt: now,
				updatedAt: now,
				...args,
			})
		}
	},
})

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
