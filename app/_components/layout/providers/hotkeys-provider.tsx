"use client"

import { HotkeysProvider } from "@tanstack/react-hotkeys"

export function HotkeysProviderWrapper({ children }: { children: React.ReactNode }) {
	return (
		<HotkeysProvider
			defaultOptions={{
				hotkey: { preventDefault: true },
			}}
		>
			{children}
		</HotkeysProvider>
	)
}
