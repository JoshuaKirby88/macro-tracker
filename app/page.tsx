import { FoodAdder } from "./_components/page/food-adder"
import { MacroBarChart } from "./_components/page/macro-bar-chart"
import { TodayEntries } from "./_components/page/today-entries"

const Page = () => {
	return (
		<div className="p-4 space-y-10">
			<MacroBarChart />

			<TodayEntries />

			<FoodAdder />
		</div>
	)
}

export default Page
