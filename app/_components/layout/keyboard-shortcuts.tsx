"use client"

import { useHotkeySequence } from "@tanstack/react-hotkeys"
import { usePathname, useRouter } from "next/navigation"
import { shortcuts } from "@/utils/shortcuts-config"

export const KeyboardShortcuts = () => {
	const router = useRouter()
	const pathname = usePathname()

	useHotkeySequence([...shortcuts.navigation.home.sequence], () => {
		if (pathname !== shortcuts.navigation.home.path) {
			router.push(shortcuts.navigation.home.path)
		}
	})

	useHotkeySequence([...shortcuts.navigation.settings.sequence], () => {
		if (pathname !== shortcuts.navigation.settings.path) {
			router.push(shortcuts.navigation.settings.path)
		}
	})

	useHotkeySequence([...shortcuts.navigation.export.sequence], () => {
		if (pathname !== shortcuts.navigation.export.path) {
			router.push(shortcuts.navigation.export.path)
		}
	})

	useHotkeySequence([...shortcuts.navigation.search.sequence], () => {
		if (pathname !== shortcuts.navigation.search.path) {
			router.push(shortcuts.navigation.search.path)
		}
	})

	useHotkeySequence([...shortcuts.navigation.foods.sequence], () => {
		if (pathname !== shortcuts.navigation.foods.path) {
			router.push(shortcuts.navigation.foods.path)
		}
	})

	return null
}
