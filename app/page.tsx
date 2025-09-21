import { Suspense } from "react"
import { FoodAdder } from "./_components/page/food-adder"
import { MacroBarChart } from "./_components/page/macro-bar-chart"
import { SelectedDateController } from "./_components/page/selected-date-controller"
import { TodayEntries } from "./_components/page/today-entries/today-entries"

const Page = () => {
	return (
		<div className="space-y-10 p-4">
			<div className="flex items-center justify-end">
				<SelectedDateController />
			</div>

			<MacroBarChart />

			<TodayEntries />

			<Suspense>
				<FoodAdder />
			</Suspense>
		</div>
	)
}

export default Page
