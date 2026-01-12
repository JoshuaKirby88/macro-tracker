import { Suspense } from "react"
import { FoodForm } from "@/components/food/food-form/food-form"

const Page = () => {
	return (
		<Suspense fallback={null}>
			<FoodForm type="create" />
		</Suspense>
	)
}

export default Page
