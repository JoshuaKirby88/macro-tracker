import { v } from "convex/values"
import { dateFormatter } from "@/utils/date-formatter"
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

export const totalsForDate = query({
	args: { forDate: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) return null

		const { startMs, endMs } = dateFormatter.dateStringToRange(args.forDate)

		const entries = await ctx.db
			.query("entry")
			.withIndex("by_user_loggedAt", (q) => q.eq("userId", identity.subject).gte("loggedAt", startMs).lt("loggedAt", endMs))
			.collect()

		if (entries.length === 0) {
			return { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 }
		}

		const foods = await Promise.all(Array.from(new Set(entries.map((e) => e.foodId))).map((foodId) => ctx.db.get(foodId)))

		const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 }

		for (const entry of entries) {
			const food = foods.find((f) => f?._id === entry.foodId)
			if (!food) continue
			totals.calories += food.calories * entry.quantity
			totals.protein += food.protein * entry.quantity
			totals.fat += food.fat * entry.quantity
			totals.carbs += food.carbs * entry.quantity
			totals.sugar += food.sugar * entry.quantity
			totals.fiber += (food.fiber || 0) * entry.quantity
		}

		return totals
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
