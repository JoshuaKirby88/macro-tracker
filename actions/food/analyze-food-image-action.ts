"use server"

import { createOpenAI } from "@ai-sdk/openai"
import z from "zod/v3"
import { searchThiingsAction } from "@/actions/search-thiings-action"
import { createFoodSchema } from "@/convex/schema"
import { ai } from "@/utils/ai"
import { IMAGE_UPLOAD, isSupportedImageDataUrl } from "@/utils/food/image-upload"

const imageSearchConfig = {
	topK: 25,
	minScore: 0.15,
}

const extractionSchema = createFoodSchema.partial().extend({
	imageQuery: z.string().optional(),
})

const isPresentFieldValue = (value: unknown) => {
	if (value === null || value === undefined) return false
	if (typeof value === "string") return value.trim().length > 0
	if (typeof value === "number") return Number.isFinite(value)
	return true
}

export const analyzeFoodImageAction = async (input: { imageBase64s: string[] }) => {
	const validImages = (input.imageBase64s ?? []).filter((s) => {
		if (!s) return false
		if (/^https?:\/\//i.test(s)) return true
		return isSupportedImageDataUrl(s)
	})

	if (validImages.length === 0) {
		throw new Error(`No supported images found. ${IMAGE_UPLOAD.supportedMimeTypeError}`)
	}

	const openai = createOpenAI({
		baseURL: process.env.OPENAI_BASE_URL,
	})

	const { object } = await ai.getObject({
		model: openai("google/gemini-3-flash-preview"),
		schema: extractionSchema,
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: [
							"You are extracting structured nutrition information from an image of food packaging or a nutrition label.",
							"- Output ONLY fields you can clearly read from the image.",
							"- Do NOT infer or guess missing values.",
							"- Use numbers for all numeric values.",
							"- Units:",
							"  • calories: Cal",
							"  • protein/fat/carbs/fiber/sugar: grams (g)",
							"- If serving size is present, include both servingSize (number) and servingUnit (string), e.g. 1 and 'cup', or 30 and 'g'.",
							"- Also return imageQuery as a short 1-2 word food search phrase using common food terms, not exact brand/product names.",
						].join("\n"),
					},
					...validImages.map((image) => ({ type: "image" as const, image })),
				],
			},
		],
	})

	const rawImageQuery = typeof object.imageQuery === "string" ? object.imageQuery.trim() || undefined : undefined
	const fields = Object.fromEntries(
		Object.entries(object)
			.filter(([key, value]) => key !== "imageQuery" && isPresentFieldValue(value))
			.map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
	) as Partial<z.infer<typeof createFoodSchema>>

	if (rawImageQuery) {
		const { fileNames } = await searchThiingsAction({
			query: rawImageQuery,
			topK: imageSearchConfig.topK,
			minScore: imageSearchConfig.minScore,
		})
		const firstImage = fileNames[0]
		if (firstImage) {
			fields.image = firstImage
		}
	}

	return { fields, imageQuery: rawImageQuery }
}
