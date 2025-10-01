import { zid, zodOutputToConvex } from "convex-helpers/server/zod"
import z from "zod/v3"
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

export const byId = query({
	args: zodOutputToConvex(z.object({ id: zid("food") })),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const food = await ctx.db.get(args.id)
		if (!food || food.userId !== identity.subject) return null
		return food
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
			name: args.name?.trim(),
			image: args.image?.trim(),
			brand: args.brand?.trim(),
			description: args.description?.trim(),
			servingSize: args.servingSize,
			servingUnit: args.servingUnit?.trim(),
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

export const updateQuantitiesForFood = mutation({
	args: zodOutputToConvex(z.object({ foodId: zid("food"), previousServingSize: z.number(), nextServingSize: z.number() })),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const food = await ctx.db.get(args.foodId)
		if (!food || food.userId !== identity.subject) throw new Error("Food not found")

		const multiplier = args.previousServingSize / args.nextServingSize

		const entries = await ctx.db
			.query("entry")
			.withIndex("byFoodId", (q) => q.eq("foodId", args.foodId))
			.filter((q) => q.eq(q.field("userId"), identity.subject))
			.collect()

		const now = Date.now()

		for (const entry of entries) {
			await ctx.db.patch(entry._id, {
				quantity: entry.quantity * multiplier,
				updatedAt: now,
			})
		}
	},
})
