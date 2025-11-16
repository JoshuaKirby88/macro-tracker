"use client"

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import { DownloadIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/shadcn/button"

export const AuthButtons = () => {
	return (
		<>
			<Unauthenticated>
				<SignInButton>
					<Button variant="outline">Sign In</Button>
				</SignInButton>

				<SignUpButton>
					<Button>Sign Up</Button>
				</SignUpButton>
			</Unauthenticated>

			<Authenticated>
				<Link href="/export" className={buttonVariants({ variant: "outline", size: "icon" })} title="Export">
					<DownloadIcon />
				</Link>

				<Link href="/settings" className={buttonVariants({ variant: "outline", size: "icon" })}>
					<SettingsIcon />
				</Link>

				<UserButton />
			</Authenticated>
		</>
	)
}
