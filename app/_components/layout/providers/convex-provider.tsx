"use client"

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react"
import { env } from "@/utils/env"

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export const ConvexProvider = (props: { children: React.ReactNode }) => {
	return <BaseConvexProvider client={convex}>{props.children}</BaseConvexProvider>
}
