import { SignIn } from "@clerk/nextjs"

const Page = () => {
	return (
		<div className="flex justify-center">
			<SignIn />
		</div>
	)
}

export default Page
