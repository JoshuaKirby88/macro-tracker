"use client"

import { useQuery } from "convex/react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { api } from "@/convex/_generated/api"
import { GLOBALS } from "@/utils/globals"

const Page = () => {
	const foods = useQuery(api.foods.forUser, {})
	const [search, setSearch] = useState("")

	const sorted = [...(foods ?? [])].sort((a, b) => a.name.localeCompare(b.name))

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase()
		if (!query) return sorted
		return sorted.filter((food) => {
			const haystack = `${food.name} ${food.brand ?? ""}`.toLowerCase()
			return haystack.includes(query)
		})
	}, [search, sorted])

	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<h1 className="mb-2 font-semibold text-2xl">View all foods</h1>

			<div className="mb-4">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search foods by name or brand..."
					className="w-full rounded-md border px-3 py-2 text-sm"
					aria-label="Search foods"
					autoFocus
				/>
			</div>

			{sorted.length === 0 ? (
				<p className="text-muted-foreground">No foods yet.</p>
			) : filtered.length === 0 ? (
				<p className="text-muted-foreground">No foods match your search.</p>
			) : (
				<div className="grid gap-2">
					{filtered.map((food) => (
						<Link key={food._id} href={`/foods/${food._id}`} className="flex items-center gap-3 rounded-md border p-1 hover:bg-muted/50">
							<Image src={GLOBALS.thiings(food.image)} alt={food.name} width={60} height={60} className="rounded" />
							<div className="min-w-0">
								<div className="truncate font-medium">
									{food.name}
									{food.brand ? ` (${food.brand})` : ""}
								</div>
								<div className="truncate text-muted-foreground text-sm">
									{food.servingSize} {food.servingUnit} • {food.calories} kcal
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}

export default Page
