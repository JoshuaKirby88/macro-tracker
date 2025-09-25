import { preloadQuery } from "convex/nextjs"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { buttonVariants } from "@/components/shadcn/button"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { FoodDetails } from "./_components/food-details"

const Page = async (props: { params: Promise<{ foodId: string }> }) => {
	const params = await props.params
	const id = params.foodId as Food["_id"]
	const preloadedFood = await preloadQuery(api.foods.byId, { id })

	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<div className="mb-4 flex items-center gap-2">
				<Link href="/foods" className={buttonVariants({ variant: "outline", size: "icon" })} aria-label="Back to foods">
					<ChevronLeftIcon />
				</Link>
				<h1 className="font-semibold text-2xl">Edit food</h1>
			</div>

			<Suspense>
				<FoodDetails preloadedFood={preloadedFood} />
			</Suspense>
		</div>
	)
}

export default Page
