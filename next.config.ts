import type { NextConfig } from "next"

export default {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "thiings.joshuakirby.webcam",
				port: "",
				pathname: "/**",
			},
		],
	},
} satisfies NextConfig

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev({ experimental: { remoteBindings: true } })
