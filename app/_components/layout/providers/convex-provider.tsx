"use client"

import { useAuth } from "@clerk/nextjs"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { env } from "@/utils/env"

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export const ConvexProvider = (props: { children: React.ReactNode }) => {
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			{props.children}
		</ConvexProviderWithClerk>
	)
}
