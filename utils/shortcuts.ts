import { useEffect, useRef } from "react"

const isEditableElement = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false
	const tag = target.tagName
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable
}

const shortcutRegistry = new Map<string, Set<() => void>>()
let leaderActive = false
let leaderTimeout: ReturnType<typeof setTimeout> | null = null
let listenerAttached = false
const LEADER_KEY = "x"
const LEADER_TIMEOUT_MS = 1500

const resetLeader = () => {
	leaderActive = false
	if (leaderTimeout) {
		clearTimeout(leaderTimeout)
		leaderTimeout = null
	}
}

const activateLeader = () => {
	leaderActive = true
	if (leaderTimeout) clearTimeout(leaderTimeout)
	leaderTimeout = setTimeout(() => {
		leaderActive = false
		leaderTimeout = null
	}, LEADER_TIMEOUT_MS)
}

const handleKeyDown = (event: KeyboardEvent) => {
	if (isEditableElement(event.target)) return
	const key = event.key.toLowerCase()
	const isLeaderCombo = event.ctrlKey && !event.metaKey && !event.altKey && key === LEADER_KEY

	if (isLeaderCombo) {
		activateLeader()
		event.preventDefault()
		return
	}

	if (!leaderActive) return

	const handlers = shortcutRegistry.get(key)
	resetLeader()

	if (!handlers || handlers.size === 0) return
	event.preventDefault()
	handlers.forEach((handler) => {
		handler()
	})
}

const ensureListener = () => {
	if (listenerAttached || typeof window === "undefined") return
	window.addEventListener("keydown", handleKeyDown)
	listenerAttached = true
}

const detachListenerIfUnused = () => {
	if (shortcutRegistry.size === 0 && listenerAttached && typeof window !== "undefined") {
		window.removeEventListener("keydown", handleKeyDown)
		listenerAttached = false
	}
}

const registerShortcut = (key: string, handler: () => void) => {
	if (typeof window === "undefined") return () => {}
	ensureListener()
	const normalized = key.toLowerCase()
	let handlers = shortcutRegistry.get(normalized)
	if (!handlers) {
		handlers = new Set()
		shortcutRegistry.set(normalized, handlers)
	}
	handlers.add(handler)

	return () => {
		const current = shortcutRegistry.get(normalized)
		if (!current) return
		current.delete(handler)
		if (current.size === 0) {
			shortcutRegistry.delete(normalized)
			detachListenerIfUnused()
		}
	}
}

type ShortcutConfig = { key: string; handler: () => void; enabled?: boolean }

export const useLeaderShortcut = (shortcut: ShortcutConfig | ShortcutConfig[]) => {
	const configs = Array.isArray(shortcut) ? shortcut : [shortcut]
	const handlerDependencies = configs.map((config) => config.handler)
	const serializedShortcuts = JSON.stringify(configs.map((config) => ({ key: config.key, enabled: config.enabled !== false })))
	const handlersRef = useRef<(() => void)[]>([])
	handlersRef.current = handlerDependencies

	useEffect(() => {
		const parsed = JSON.parse(serializedShortcuts) as { key: string; enabled: boolean }[]
		const active = parsed
			.map((entry, index) => ({ key: entry.key, handler: handlersRef.current[index], enabled: entry.enabled }))
			.filter((entry): entry is { key: string; handler: () => void; enabled: boolean } => entry.enabled && typeof entry.handler === "function")
		if (active.length === 0) return
		const unregisters = active.map((config) => registerShortcut(config.key, config.handler))
		return () =>
			unregisters.forEach((unregister) => {
				unregister()
			})
	}, [serializedShortcuts, ...handlerDependencies])
}

export const getShortcutLabel = (key: string) => `Ctrl+X ${key.toUpperCase()}`
