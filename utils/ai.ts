import { openai } from "@ai-sdk/openai"
import { embed } from "ai"

export const ai = {
	async embed(input: { model: Parameters<typeof openai.textEmbeddingModel>[0]; text: string; dimensions: number }) {
		const { embedding } = await embed({
			model: openai.textEmbeddingModel(input.model),
			value: input.text,
			providerOptions: { openai: { dimensions: input.dimensions } },
		})

		return embedding
	},
}
