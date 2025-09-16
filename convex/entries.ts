import { mutation } from "./_generated/server"
import { v } from "convex/values"

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
