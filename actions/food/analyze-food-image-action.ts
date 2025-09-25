"use server"

import { openai } from "@ai-sdk/openai"
import { createFoodSchema } from "@/convex/schema"
import { ai } from "@/utils/ai"

export const analyzeFoodImageAction = async (input: { imageBase64s: string[] }) => {
	const SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
	const validImages = (input.imageBase64s ?? []).filter((s) => {
		if (!s) return false
		// Allow remote HTTP(S) images too
		if (/^https?:\/\//i.test(s)) return true
		const match = /^data:([^;]+);base64,/i.exec(s)
		if (!match) return false
		const mime = match[1].toLowerCase()
		return SUPPORTED_MIME.has(mime)
	})

	if (validImages.length === 0) {
		throw new Error("No supported images found. Please upload JPEG, PNG, WEBP, or GIF.")
	}
	const { object } = await ai.getObject({
		model: openai("gpt-5-nano"),
		schema: createFoodSchema.partial(),
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
							"  • calories: kcal",
							"  • protein/fat/carbs/fiber/sugar: grams (g)",
							"- If serving size is present, include both servingSize (number) and servingUnit (string), e.g. 1 and 'cup', or 30 and 'g'.",
						].join("\n"),
					},
					...validImages.map((image) => ({ type: "image" as const, image })),
				],
			},
		],
	})

	const cleaned = Object.fromEntries(Object.entries(object).filter(([, v]) => !!v))

	return { fields: cleaned }
}
