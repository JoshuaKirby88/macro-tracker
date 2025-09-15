import type { NextConfig } from "next"

export default {} satisfies NextConfig

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev({ experimental: { remoteBindings: true } })
