export const LEADER_KEY = "Control+X"

export const shortcuts = {
	navigation: {
		home: { sequence: ["Control+X", "H"] as const, label: "Home", path: "/" },
		settings: { sequence: ["Control+X", "S"] as const, label: "Settings", path: "/settings" },
		export: { sequence: ["Control+X", "E"] as const, label: "Export", path: "/export" },
		search: { sequence: ["Control+X", "P"] as const, label: "Search", path: "/search" },
		foods: { sequence: ["Control+X", "F"] as const, label: "Foods", path: "/foods" },
	},
	date: {
		prevDay: { sequence: ["Control+X", "ArrowLeft"] as const, label: "Previous day" },
		nextDay: { sequence: ["Control+X", "ArrowRight"] as const, label: "Next day" },
		today: { sequence: ["Control+X", "T"] as const, label: "Today" },
		calendar: { sequence: ["Control+X", "C"] as const, label: "Calendar" },
	},
	food: {
		publicSearch: { sequence: ["Control+X", "U"] as const, label: "USDA search" },
		manageFoods: { sequence: ["Control+X", "F"] as const, label: "Manage foods", path: "/foods" },
		createFood: { sequence: ["Control+X", "N"] as const, label: "Create food", path: "/create" },
		focusQuantity: { sequence: ["Control+X", "Q"] as const, label: "Focus quantity" },
		submit: { sequence: ["Control+X", "R"] as const, label: "Track entry" },
		breakfast: { sequence: ["Control+X", "B"] as const, label: "Breakfast" },
		lunch: { sequence: ["Control+X", "L"] as const, label: "Lunch" },
		dinner: { sequence: ["Control+X", "D"] as const, label: "Dinner" },
	},
	command: {
		togglePalette: { key: "Mod+K", label: "Command palette" },
	},
} as const

export type ShortcutSequence = readonly [string, string]

const keySymbols: Record<string, string> = {
	ArrowLeft: "←",
	ArrowRight: "→",
	ArrowUp: "↑",
	ArrowDown: "↓",
}

export function getKeyLabel(key: string): string {
	return keySymbols[key] ?? key.toUpperCase()
}

export function getSequenceLabel(sequence: ShortcutSequence): string {
	const [_leader, key] = sequence
	return `Ctrl+X ${getKeyLabel(key)}`
}
