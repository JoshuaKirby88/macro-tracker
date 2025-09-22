"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FoodForm } from "./_components/food-form"

const Page = () => {
	const foods = useQuery(api.foods.forUser, {})

	const sorted = [...(foods ?? [])].sort((a, b) => a.name.localeCompare(b.name))

	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<h1 className="mb-4 font-semibold text-2xl">Edit foods</h1>

			{sorted.length === 0 ? (
				<p className="text-muted-foreground">No foods yet.</p>
			) : (
				<div className="grid gap-4">
					{sorted.map((food) => (
						<FoodForm key={food._id} food={food} />
					))}
				</div>
			)}
		</div>
	)
}

export default Page
