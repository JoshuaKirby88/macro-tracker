import { v } from "convex/values"
import { dateFormatter } from "@/utils/date-formatter"
import { mutation, query } from "./_generated/server"

export const create = mutation({
	args: {
		foodId: v.id("food"),
		quantity: v.number(),
		mealType: v.optional(v.string()),
		note: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const food = await ctx.db.get(args.foodId)
		if (!food || food.userId !== identity.subject) throw new Error("Food not found")

		const now = Date.now()
		const entryId = await ctx.db.insert("entry", {
			userId: identity.subject,
			foodId: args.foodId,
			quantity: args.quantity,
			loggedAt: now,
			mealType: args.mealType,
			note: args.note,
			createdAt: now,
			updatedAt: now,
		})

		return entryId
	},
})

export const withFoodsForDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const { startMs, endMs } = dateFormatter.dateStringToRange(args.forDate)

		const entries = await ctx.db
			.query("entry")
			.withIndex("by_user_loggedAt", (q) => q.eq("userId", identity.subject).gte("loggedAt", startMs).lt("loggedAt", endMs))
			.collect()

		const foods = (await Promise.all(Array.from(new Set(entries.map((e) => e.foodId))).map((foodId) => ctx.db.get(foodId)))).filter((food) => food !== null)

		return { entries, foods }
	},
})
