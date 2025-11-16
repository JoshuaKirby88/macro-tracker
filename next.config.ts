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
	experimental: {
		serverActions: {
			bodySizeLimit: "50mb",
		},
	},
} satisfies NextConfig

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev({ remoteBindings: true })
