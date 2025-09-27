import { FoodsList } from "./_components/foods-list"

const Page = () => {
	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<h1 className="mb-2 font-semibold text-2xl">View all foods</h1>
			<FoodsList />
		</div>
	)
}

export default Page
