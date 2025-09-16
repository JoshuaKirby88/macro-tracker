import { MacroBarChart } from "./_components/page/macro-bar-chart"
import { FoodAdder } from "./_components/page/food-adder"
import { TodayEntries } from "./_components/page/today-entries"

const Page = () => {
	return (
		<div className="p-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
			<MacroBarChart />
			<div className="h-4" />
			<TodayEntries />
			<div className="h-4" />
			<FoodAdder />
		</div>
	)
}

export default Page
