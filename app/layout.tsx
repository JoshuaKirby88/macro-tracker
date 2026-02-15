import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { SFProRoundedSemibold } from "@/components/fonts/fonts"
import { Toaster } from "@/components/shadcn/sonner"
import { cn } from "@/utils/cn"
import { GLOBALS } from "@/utils/globals"
import { KeyboardShortcuts } from "./_components/layout/keyboard-shortcuts"
import { AuthButtons } from "./_components/layout/navbar/auth-buttons"
import { ConvexProvider } from "./_components/layout/providers/convex-provider"
import { HotkeysProviderWrapper } from "./_components/layout/providers/hotkeys-provider"
import { ReactQueryProvider } from "./_components/layout/providers/react-query-provider"
import { ThemeProvider } from "./_components/layout/providers/theme-provider"
import { ThemeDropdown } from "./_components/layout/theme-dropdown"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Onigiri",
	description: "Onigiri - AI Macro Tracker",
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#111111" },
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
	],
	appleWebApp: {
		capable: true,
		statusBarStyle: "black",
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-icon.png",
	},
	manifest: "/manifest.webmanifest",
}

export const viewport: Viewport = {
	viewportFit: "cover",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111111" />
					<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
				</head>

				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider>
						<HotkeysProviderWrapper>
							<KeyboardShortcuts />
							<ReactQueryProvider>
								<ConvexProvider>
									<header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background p-4">
										<Link href="/" aria-label="Home" className="inline-flex items-center gap-1">
											<Image src={GLOBALS.thiings("/onigiri")} alt="Macro Tracker" width={34} height={34} priority />
											<span className={cn("text-muted-foreground text-xl transition-all hover:text-foreground", SFProRoundedSemibold.className)}>Onigiri</span>
										</Link>

										<div className="flex items-center gap-4">
											<ThemeDropdown />

											<AuthButtons />
										</div>
									</header>

									{children}

									<Toaster position="top-right" />

									<Script id="sw-register" strategy="afterInteractive">
										{`if ('serviceWorker' in navigator) {
											window.addEventListener('load', () => {
												navigator.serviceWorker.register('/sw.js').catch(() => {})
											})
										}`}
									</Script>
								</ConvexProvider>
							</ReactQueryProvider>
						</HotkeysProviderWrapper>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	)
}
