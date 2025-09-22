"use client"

import { useQuery } from "convex/react"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { buttonVariants } from "@/components/shadcn/button"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { FoodForm } from "./_components/food-form"

const Page = () => {
	const params = useParams<{ foodId: string }>()
	const id = params.foodId as Food["_id"]
	const food = useQuery(api.foods.byId, id ? { id } : "skip")

	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<div className="mb-4 flex items-center gap-2">
				<Link href="/foods" className={buttonVariants({ variant: "outline", size: "icon" })} aria-label="Back to foods">
					<ChevronLeftIcon className="size-4" />
				</Link>
				<h1 className="font-semibold text-2xl">Edit food</h1>
			</div>
			{food === undefined ? <p className="text-muted-foreground">Loading…</p> : food === null ? <p className="text-destructive">Food not found.</p> : <FoodForm food={food} />}
		</div>
	)
}

export default Page
