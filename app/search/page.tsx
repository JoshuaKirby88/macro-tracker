"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { type PublicFood, PublicFoodSearch } from "@/components/food/public-food-search"
import { Button } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"

const Page = () => {
	const router = useRouter()
	const [selectedFood, setSelectedFood] = useState<PublicFood | null>(null)

	const handleImport = () => {
		if (!selectedFood) return

		const params = new URLSearchParams()
		if (selectedFood.name) params.set("name", selectedFood.name)
		if (selectedFood.brand) params.set("brand", selectedFood.brand)
		if (selectedFood.description) params.set("description", selectedFood.description)
		if (selectedFood.servingSize) params.set("servingSize", String(selectedFood.servingSize))
		if (selectedFood.servingUnit) params.set("servingUnit", selectedFood.servingUnit)
		if (selectedFood.calories) params.set("calories", String(selectedFood.calories))
		if (selectedFood.protein) params.set("protein", String(selectedFood.protein))
		if (selectedFood.fat) params.set("fat", String(selectedFood.fat))
		if (selectedFood.carbs) params.set("carbs", String(selectedFood.carbs))
		if (selectedFood.fiber) params.set("fiber", String(selectedFood.fiber))
		if (selectedFood.sugar) params.set("sugar", String(selectedFood.sugar))

		router.push(`/create?${params.toString()}`)
	}

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Card className="w-full max-w-lg">
				<div className="flex flex-col gap-6 p-6">
					<div>
						<h1 className="font-bold text-2xl">Search Public Foods</h1>
						<p className="text-muted-foreground">Search the USDA food database to import foods</p>
					</div>

					<PublicFoodSearch onSelect={setSelectedFood} />

					{selectedFood && (
						<Button onClick={handleImport} className="w-full">
							Review and Import "{selectedFood.name}"
						</Button>
					)}
				</div>
			</Card>
		</div>
	)
}

export default Page
