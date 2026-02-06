"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { useLeaderShortcut } from "@/utils/shortcuts"

const NAV_SHORTCUTS = [
	{ key: "h", path: "/" },
	{ key: "s", path: "/settings" },
	{ key: "e", path: "/export" },
	{ key: "p", path: "/search" },
	{ key: "f", path: "/foods" },
]

export const KeyboardShortcuts = () => {
	const router = useRouter()
	const pathname = usePathname()

	const shortcuts = useMemo(
		() =>
			NAV_SHORTCUTS.map(({ key, path }) => ({
				key,
				handler: () => {
					if (pathname !== path) {
						router.push(path)
					}
				},
			})),
		[pathname, router],
	)

	useLeaderShortcut(shortcuts)

	return null
}
