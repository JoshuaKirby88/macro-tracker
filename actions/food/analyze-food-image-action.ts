"use server"

import { openai } from "@ai-sdk/openai"
import { createFoodSchema } from "@/convex/schema"
import { ai } from "@/utils/ai"

export const analyzeFoodImageAction = async (input: { imageBase64: string }) => {
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
					{ type: "image", image: input.imageBase64 },
				],
			},
		],
	})

	const cleaned = Object.fromEntries(Object.entries(object).filter(([, v]) => !!v))

	return { fields: cleaned }
}
