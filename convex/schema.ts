import { defineSchema, defineTable } from "convex/server"
import { zid, zodOutputToConvex } from "convex-helpers/server/zod"
import z from "zod/v3"

export type Food = z.infer<typeof foodSchema>
export const foodSchema = z.object({
	userId: z.string(),
	name: z.string(),
	image: z.string(),
	brand: z.optional(z.string()),
	description: z.optional(z.string()),
	servingSize: z.number(),
	servingUnit: z.string(),
	calories: z.number(),
	protein: z.number(),
	fat: z.number(),
	carbs: z.number(),
	sugar: z.number(),
	fiber: z.number(),
	createdAt: z.number(),
	updatedAt: z.number(),
})
export const createFoodSchema = foodSchema.omit({ userId: true, createdAt: true, updatedAt: true })

export type Entry = z.infer<typeof entrySchema>
export const entrySchema = z.object({
	userId: z.string(),
	foodId: zid("food"),
	quantity: z.number(),
	entryDate: z.string(),
	mealType: z.enum(["breakfast", "lunch", "dinner"]),
	note: z.optional(z.string()),
	createdAt: z.number(),
	updatedAt: z.number(),
})
export const createEntrySchema = entrySchema.omit({ userId: true, createdAt: true, updatedAt: true })

export type Goal = z.infer<typeof goalSchema>
export const goalSchema = z.object({
	userId: z.string(),
	startDate: z.string(),
	calories: z.optional(z.number()),
	protein: z.optional(z.number()),
	fat: z.optional(z.number()),
	carbs: z.optional(z.number()),
	createdAt: z.number(),
	updatedAt: z.number(),
})
export const createOrUpdateGoalSchema = goalSchema.omit({ userId: true, createdAt: true, updatedAt: true })

export default defineSchema({
	food: defineTable(zodOutputToConvex(foodSchema)).index("byUserId", ["userId", "name"]),
	entry: defineTable(zodOutputToConvex(entrySchema)).index("byUserIdEntryDate", ["userId", "entryDate"]),
	goal: defineTable(zodOutputToConvex(goalSchema)).index("byUserIdStartDate", ["userId", "startDate"]),
})
