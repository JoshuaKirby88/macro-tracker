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

			<Suspense>
				{(async () => {
					const date = dateUtil.getDateString(new Date())
					const preloadedEntries = await preloadQuery(api.entries.withFoodsForDate, { date })
					const preloadedGoal = await preloadQuery(api.goals.forDate, { date })
					return <MacroBarChart preloadedEntries={preloadedEntries} preloadedGoal={preloadedGoal} />
				})()}
			</Suspense>

			<Suspense>
				{(async () => {
					const preloadedEntries = await preloadQuery(api.entries.withFoodsForDate, { date: dateUtil.getDateString(new Date()) })
					return <TodayEntries preloadedEntries={preloadedEntries} />
				})()}
			</Suspense>

			<Suspense>
				{(async () => {
					const preloadedFoods = await preloadQuery(api.foods.forUser, {})
					return <FoodAdder preloadedFoods={preloadedFoods} />
				})()}
			</Suspense>
		</div>
	)
}

export default Page
