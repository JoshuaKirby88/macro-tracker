import { openai } from "@ai-sdk/openai"
import { embed, generateObject } from "ai"
import type z from "zod/v3"

export const ai = {
	async embed(input: { model: Parameters<typeof openai.textEmbeddingModel>[0]; text: string; dimensions: number }) {
		const completion = await embed({
			model: openai.textEmbeddingModel(input.model),
			value: input.text,
			providerOptions: { openai: { dimensions: input.dimensions } },
		})

		return completion.embedding
	},
	getObject<T extends z.ZodTypeAny>(...args: Parameters<typeof generateObject<T>>) {
		return generateObject(...args)
	},
}
