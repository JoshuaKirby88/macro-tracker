import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["**/*.test.{ts,tsx}"],
		exclude: ["node_modules", ".next", "dist", ".convex"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
})
