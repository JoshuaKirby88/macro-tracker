import { defineSchema, defineTable } from "convex/server"
import { zid, zodOutputToConvex } from "convex-helpers/server/zod"
import z from "zod/v3"
import type { DataModel } from "./_generated/dataModel"

export type Food = Pretty<z.infer<typeof foodSchema> & { _id: DataModel["food"]["document"]["_id"] }>
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
	touchedAt: z.number(),
})
export const createFoodSchema = foodSchema.omit({ userId: true, createdAt: true, updatedAt: true, touchedAt: true })
export const updateFoodSchema = foodSchema.omit({ userId: true, createdAt: true, updatedAt: true, touchedAt: true }).partial()

export type Entry = Pretty<z.infer<typeof entrySchema> & { _id: DataModel["entry"]["document"]["_id"] }>
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
export const updateEntrySchema = entrySchema.omit({ userId: true, createdAt: true, updatedAt: true })

const mealGoalSchema = z.object({
	calories: z.optional(z.number()),
	protein: z.optional(z.number()),
	fat: z.optional(z.number()),
	carbs: z.optional(z.number()),
	fiber: z.optional(z.number()),
})

export type Goal = Pretty<z.infer<typeof goalSchema> & { _id: DataModel["goal"]["document"]["_id"] }>
export const goalSchema = z.object({
	userId: z.string(),
	startDate: z.string(),
	breakfast: z.optional(mealGoalSchema),
	lunch: z.optional(mealGoalSchema),
	dinner: z.optional(mealGoalSchema),
	createdAt: z.number(),
	updatedAt: z.number(),
})
export const createOrUpdateGoalSchema = goalSchema.omit({ userId: true, createdAt: true, updatedAt: true })

export default defineSchema({
	food: defineTable(zodOutputToConvex(foodSchema)).index("byUserId", ["userId", "name"]),
	entry: defineTable(zodOutputToConvex(entrySchema)).index("byUserIdEntryDate", ["userId", "entryDate"]).index("byFoodId", ["foodId"]),
	goal: defineTable(zodOutputToConvex(goalSchema)).index("byUserIdStartDate", ["userId", "startDate"]),
})
