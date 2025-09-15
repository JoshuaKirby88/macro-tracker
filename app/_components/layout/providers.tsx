"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { env } from "@/utils/env"

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export const Providers = (props: { children: React.ReactNode }) => {
	return <ConvexProvider client={convex}>{props.children}</ConvexProvider>
}
