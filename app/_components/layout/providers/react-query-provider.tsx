"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"

export const ReactQueryProvider = (props: { children: React.ReactNode }) => {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000,
						gcTime: 30 * 60 * 1000,
						refetchOnWindowFocus: false,
						refetchOnReconnect: true,
						retry: 1,
					},
					mutations: { retry: 1 },
				},
			}),
	)

	return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}
