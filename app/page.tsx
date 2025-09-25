import { preloadQuery } from "convex/nextjs"
import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { dateUtil } from "@/utils/date-util"
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

			<Suspense>
				{(async () => {
					const preloadedEntries = await preloadQuery(api.entries.withFoodsForDate, { date: dateUtil.getDateString(new Date()) })
					return <TodayEntries preloadedEntries={preloadedEntries} />
				})()}
			</Suspense>

			<Suspense>
				<FoodAdder />
			</Suspense>
		</div>
	)
}

export default Page
