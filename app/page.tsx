import { MacroBarChart } from "./_components/page/macro-bar-chart"
import { FoodAdder } from "./_components/page/food-adder"

const Page = () => {
	return (
		<div className="p-4">
			<MacroBarChart />
			<div className="h-4" />
			<FoodAdder />
		</div>
	)
}

export default Page
