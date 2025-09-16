import { env } from "@/utils/env"

export default {
	providers: [
		{
			domain: env.CLERK_FRONTEND_API_URL,
			applicationID: "convex",
		},
	],
}
