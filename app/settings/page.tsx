import { preloadQuery } from "convex/nextjs"
import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { dateUtil } from "@/utils/date-util"
import { SettingsForm } from "./_components/settings-form"

const Page = () => {
	return (
		<div className="mx-auto w-[50rem] max-w-[95%] p-4">
			<Suspense>
				{(async () => {
					const date = dateUtil.getDateString(new Date())
					const preloadedGoal = await preloadQuery(api.goals.forDate, { date })
					return <SettingsForm preloadedGoal={preloadedGoal} />
				})()}
			</Suspense>
		</div>
	)
}

export default Page
