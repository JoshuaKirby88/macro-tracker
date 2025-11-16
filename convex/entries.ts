import { v } from "convex/values"
import { zid, zodOutputToConvex } from "convex-helpers/server/zod"
import z from "zod/v3"
import { mutation, query } from "./_generated/server"
import { createEntrySchema, updateEntrySchema } from "./schema"

export const create = mutation({
	args: zodOutputToConvex(createEntrySchema),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const food = await ctx.db.get(args.foodId)
		if (!food || food.userId !== identity.subject) throw new Error("Food not found")

		const now = Date.now()

		const entryId = await ctx.db.insert("entry", {
			userId: identity.subject,
			createdAt: now,
			updatedAt: now,
			...args,
		})

		await ctx.db.patch(food._id, { touchedAt: now })

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

export const update = mutation({
	args: zodOutputToConvex(updateEntrySchema.extend({ id: zid("entry") })),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await ctx.db.get(args.id)
		if (!existing || existing.userId !== identity.subject) throw new Error("Entry not found")

		const food = await ctx.db.get(args.foodId)
		if (!food || food.userId !== identity.subject) throw new Error("Food not found")

		const now = Date.now()

		await ctx.db.patch(args.id, {
			foodId: args.foodId,
			quantity: args.quantity,
			entryDate: args.entryDate,
			mealType: args.mealType,
			note: args.note,
			updatedAt: now,
		})

		if (existing.foodId !== args.foodId) {
			await ctx.db.patch(args.foodId, { touchedAt: now })
		}
	},
})

export const byFoodId = query({
	args: zodOutputToConvex(z.object({ foodId: zid("food") })),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return []

		return ctx.db
			.query("entry")
			.withIndex("byFoodId", (q) => q.eq("foodId", args.foodId))
			.filter((q) => q.eq(q.field("userId"), identity.subject))
			.collect()
	},
})

export const remove = mutation({
	args: zodOutputToConvex(z.object({ id: zid("entry") })),

	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await ctx.db.get(args.id)
		if (!existing || existing.userId !== identity.subject) throw new Error("Entry not found")

		await ctx.db.delete(args.id)
	},
})

export const withFoodsForDateRange = query({
	args: { startDate: v.string(), endDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		// Get all entries for the user
		const allEntries = await ctx.db
			.query("entry")
			.withIndex("byUserIdEntryDate")
			.filter((q) => q.eq(q.field("userId"), identity.subject))
			.collect()

		// Filter entries by date range
		const entries = allEntries.filter((entry) => {
			return entry.entryDate >= args.startDate && entry.entryDate <= args.endDate
		})

		// Get unique food IDs and fetch foods
		const foodIds = Array.from(new Set(entries.map((e) => e.foodId)))
		const foods = (await Promise.all(foodIds.map((foodId) => ctx.db.get(foodId)))).filter((food) => food !== null)

		return { entries, foods }
	},
})
