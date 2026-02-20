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

export const analyzeFoodImageAction = async (input: { imageBase64: string }) => {
	const isValidImage = (() => {
		if (!input.imageBase64) return false
		if (/^https?:\/\//i.test(input.imageBase64)) return true
		return isSupportedImageDataUrl(input.imageBase64)
	})()

	if (!isValidImage) {
		throw new Error(`No supported image found. ${IMAGE_UPLOAD.supportedMimeTypeError}`)
	}

	const validImages = [input.imageBase64]

	const openai = createOpenAI({
		baseURL: process.env.OPENAI_BASE_URL,
	})

	const { object } = await ai.getObject({
		model: openai("google/gemini-3-flash-preview"),
		schema: extractionSchema,
		maxOutputTokens: 1000,
		messages: [
			{
				role: "system",
				content: [
					"You are a precise nutrition label scanner.",
					"- Extract ONLY values you can clearly read from the image.",
					"- Do NOT infer or guess missing values.",
					"- Return all numeric values as plain numbers (e.g., '10' not '10 Cal', '0.5' not '0.5g').",
					"- Units: calories in Cal, protein/fat/carbs/fiber/sugar in grams (g).",
					"- If serving size is present, return servingSize as number and servingUnit as string.",
					"- If a value shows '<1g' or similar (less than), return 0.",
					"- Also return imageQuery: a short 1-2 word food search phrase, common terms only, no brand names.",
					"- Reasonable max values: calories up to 10000, macros up to 1000g.",
				].join("\n"),
			},
			{
				role: "user",
				content: validImages.map((image) => ({ type: "image" as const, image })),
			},
		],
		providerOptions: {
			google: {
				thinkingConfig: { thinkingLevel: "minimal" },
			},
		},
	})

	const rawImageQuery = object.imageQuery?.trim() || undefined

	const parsedFields: Record<string, string | number | undefined> = {}
	for (const [key, value] of Object.entries(object)) {
		if (key === "imageQuery") continue
		if (key === "name" || key === "brand" || key === "description" || key === "image" || key === "servingUnit") {
			if (typeof value === "string" && value.trim()) {
				parsedFields[key] = value.trim()
			}
		} else if (typeof value === "number" && Number.isFinite(value)) {
			parsedFields[key] = value
		}
	}

	const fields = parsedFields as Record<string, string | number>

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
