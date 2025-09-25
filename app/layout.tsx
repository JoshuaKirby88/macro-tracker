import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { SFProRoundedSemibold } from "@/components/fonts/fonts"
import { Toaster } from "@/components/shadcn/sonner"
import { cn } from "@/utils/cn"
import { GLOBALS } from "@/utils/globals"
import { AuthButtons } from "./_components/layout/navbar/auth-buttons"
import { ConvexProvider } from "./_components/layout/providers/convex-provider"
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
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider>
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

								<Toaster />
							</ConvexProvider>
						</ReactQueryProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	)
}
