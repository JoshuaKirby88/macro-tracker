import { zid, zodOutputToConvex } from "convex-helpers/server/zod"
import { mutation, query } from "./_generated/server"
import { createFoodSchema, updateFoodSchema } from "./schema"

export const create = mutation({
	args: zodOutputToConvex(createFoodSchema),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const now = Date.now()

		const newFoodId = await ctx.db.insert("food", {
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
			touchedAt: now,
		})

		return newFoodId
	},
})

export const forUser = query({
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

export const update = mutation({
	args: zodOutputToConvex(updateFoodSchema.extend({ id: zid("food") })),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await ctx.db.get(args.id)
		if (!existing || existing.userId !== identity.subject) throw new Error("Food not found")

		const now = Date.now()

		await ctx.db.patch(args.id, {
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
			updatedAt: now,
		})
	},
})
