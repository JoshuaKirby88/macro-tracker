"use client"

import { useQuery } from "convex/react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Input } from "@/components/shadcn/input"
import { api } from "@/convex/_generated/api"
import { GLOBALS } from "@/utils/globals"

export const FoodsList = () => {
	const foods = useQuery(api.foods.forUser, {})
	const [search, setSearch] = useState("")
	const sorted = useMemo(() => [...(foods ?? [])].sort((a, b) => a.name.localeCompare(b.name)), [foods])

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase()
		if (!query) return sorted
		return sorted.filter((food) => {
			const haystack = `${food.name} ${food.brand ?? ""}`.toLowerCase()
			return haystack.includes(query)
		})
	}, [search, sorted])

	return (
		<>
			<Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods by name or brand..." className="mb-4 w-full" aria-label="Search foods" autoFocus />

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
									{food.servingSize} {food.servingUnit} • {food.calories} Cal
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</>
	)
}
