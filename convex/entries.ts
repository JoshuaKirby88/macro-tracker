import { v } from "convex/values"
import type { DataModel } from "./_generated/dataModel"
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

// Compute totals for a given calendar day (YYYY-MM-DD, treated as UTC day)
export const totalsForDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		// Convert YYYY-MM-DD to [start, end) in UTC milliseconds
		// Using UTC ensures deterministic behavior regardless of server timezone.
		const [yearStr, monthStr, dayStr] = args.forDate.split("-")
		const year = Number(yearStr)
		const month = Number(monthStr) - 1 // zero-based
		const day = Number(dayStr)
		if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
			throw new Error("Invalid forDate; expected YYYY-MM-DD")
		}

		const startMs = Date.UTC(year, month, day)
		const endMs = Date.UTC(year, month, day + 1)

		const entries = await ctx.db
			.query("entry")
			.withIndex("by_user_loggedAt", (q) => q.eq("userId", identity.subject).gte("loggedAt", startMs).lt("loggedAt", endMs))
			.collect()

		if (entries.length === 0) {
			return {
				forDate: args.forDate,
				totals: { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 },
			}
		}

		// Load foods referenced by these entries.
		const foodIdToFood: Record<string, any> = {}
		for (const entry of entries) {
			const id = entry.foodId
			if (foodIdToFood[id.id]) continue
			const food = await ctx.db.get(id)
			if (food && food.userId === identity.subject) {
				foodIdToFood[id.id] = food
			}
		}

		const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 }
		for (const entry of entries) {
			const food = foodIdToFood[entry.foodId.id]
			if (!food) continue
			const q = entry.quantity
			totals.calories += (food.calories || 0) * q
			totals.protein += (food.protein || 0) * q
			totals.fat += (food.fat || 0) * q
			totals.carbs += (food.carbs || 0) * q
			totals.sugar += (food.sugar || 0) * q
			totals.fiber += (food.fiber || 0) * q
		}

		return { forDate: args.forDate, totals }
	},
})

// List detailed entries for a given calendar day (YYYY-MM-DD, treated as UTC day)
export const listForDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		// Convert YYYY-MM-DD to [start, end) in UTC milliseconds
		const [yearStr, monthStr, dayStr] = args.forDate.split("-")
		const year = Number(yearStr)
		const month = Number(monthStr) - 1
		const day = Number(dayStr)
		if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
			throw new Error("Invalid forDate; expected YYYY-MM-DD")
		}

		const startMs = Date.UTC(year, month, day)
		const endMs = Date.UTC(year, month, day + 1)

		// Fetch entries within the day
		const entries = await ctx.db
			.query("entry")
			.withIndex("by_user_loggedAt", (q) => q.eq("userId", identity.subject).gte("loggedAt", startMs).lt("loggedAt", endMs))
			.collect()

		if (entries.length === 0) {
			return { forDate: args.forDate, entries: [] }
		}

		// Load unique foods referenced by these entries
		const foodIdToFood: Record<string, DataModel["food"]["document"]> = {}
		for (const entry of entries) {
			const foodId = entry.foodId as unknown as string
			if (foodIdToFood[foodId]) continue
			const food = await ctx.db.get(entry.foodId)
			if (food && food.userId === identity.subject) {
				foodIdToFood[foodId] = food
			}
		}

		// Build detailed list
		const detailed = entries
			.slice()
			.sort((a, b) => a.loggedAt - b.loggedAt)
			.map((entry) => {
				const food = foodIdToFood[entry.foodId]
				const quantity = entry.quantity
				const perServing = food
					? {
							calories: food.calories || 0,
							protein: food.protein || 0,
							fat: food.fat || 0,
							carbs: food.carbs || 0,
							sugar: food.sugar || 0,
							fiber: food.fiber || 0,
						}
					: { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 }

				const contributions = {
					calories: perServing.calories * quantity,
					protein: perServing.protein * quantity,
					fat: perServing.fat * quantity,
					carbs: perServing.carbs * quantity,
					sugar: perServing.sugar * quantity,
					fiber: perServing.fiber * quantity,
				}

				return {
					...entry,
					quantity,
					food: food ?? null,
					contributions,
				}
			})

		return { forDate: args.forDate, entries: detailed }
	},
})
