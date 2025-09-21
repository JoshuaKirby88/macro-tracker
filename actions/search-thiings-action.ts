"use server"

import { thiings } from "@/utils/thiings/thiings"

export const searchThiingsAction = async (input: { query: string; topK: number; minScore: number }) => {
	const query = input.query.trim().toLowerCase()
	if (!query) return { fileNames: [] }

	const fileNames = await thiings.query({
		embed: { model: "text-embedding-3-small", text: query, dimensions: thiings.dimensions },
		options: { topK: input.topK, minScore: input.minScore },
	})

	return { fileNames }
}
