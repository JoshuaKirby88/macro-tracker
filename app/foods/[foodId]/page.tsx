import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/shadcn/button"
import { FoodDetails } from "./_components/food-details"

const Page = () => {
	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<div className="mb-4 flex items-center gap-2">
				<Link href="/foods" className={buttonVariants({ variant: "outline", size: "icon" })}>
					<ChevronLeftIcon />
				</Link>
				<h1 className="font-semibold text-2xl">Edit food</h1>
			</div>

			<FoodDetails />
		</div>
	)
}

export default Page
