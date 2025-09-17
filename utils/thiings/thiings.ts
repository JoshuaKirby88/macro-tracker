import { getCloudflareContext } from "@opennextjs/cloudflare"
import { ai } from "../ai"
import { thiingsMeta } from "./thiings-meta"

export const thiings = {
	meta: thiingsMeta,
	dimensions: 256,
	async insert(input: { id: string; values: number[] }[]) {
		const index = (await getCloudflareContext({ async: true })).env.THIINGS_VECTOR
		await index.upsert(input)
	},
	async query(input: { embed: Parameters<typeof ai.embed>[0]; options: { topK: number; minScore: number } }) {
		const embedding = await ai.embed(input.embed)
		const index = (await getCloudflareContext({ async: true })).env.THIINGS_VECTOR
		const result = await index.query(embedding, { topK: input.options.topK, returnMetadata: "none" })
		const filteredMatches = result.matches.filter((match) => match.score >= input.options.minScore)
		return Array.from(new Set(filteredMatches.map((match) => match.id)))
	},
	async _init() {
		const items = await Promise.all(
			thiings.meta.items.map(async (item) => {
				const tags = Array.from(new Set([item.title, ...item.tags].map((tag) => tag.toLowerCase().trim())))
				const values = await ai.embed({ model: "text-embedding-3-small", text: tags.join(" "), dimensions: thiings.dimensions })
				return { id: item.file_name, values }
			}),
		)

		await thiings.insert(items)
	},
}
