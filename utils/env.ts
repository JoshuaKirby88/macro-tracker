import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		CLERK_SECRET_KEY: z.string(),
		CLERK_FRONTEND_API_URL: z.string(),
		CONVEX_DEPLOYMENT: z.string(),
		OPENAI_API_KEY: z.string(),
	},
	client: {
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
		NEXT_PUBLIC_CONVEX_URL: z.string(),
	},
	runtimeEnv: {
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		CLERK_FRONTEND_API_URL: process.env.CLERK_FRONTEND_API_URL,
		CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
		NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
	},
})
