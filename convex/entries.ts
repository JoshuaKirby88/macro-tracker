import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
	args: {
		foodId: v.id("food"),
		quantity: v.number(),
		mealType: v.optional(v.string()),
		note: v.optional(v.string()),
		date: v.string(),
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
			entryDate: args.date,
			mealType: args.mealType,
			note: args.note,
			createdAt: now,
			updatedAt: now,
		})

		return entryId
	},
})

export const withFoodsForDate = query({
	args: { date: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const entries = await ctx.db
			.query("entry")
			.withIndex("byUserIdEntryDate")
			.filter((q) => q.eq(q.field("userId"), identity.subject))
			.filter((q) => q.eq(q.field("entryDate"), args.date))
			.collect()

		const foods = (await Promise.all(Array.from(new Set(entries.map((e) => e.foodId))).map((foodId) => ctx.db.get(foodId)))).filter((food) => food !== null)

		return { entries, foods }
	},
})
