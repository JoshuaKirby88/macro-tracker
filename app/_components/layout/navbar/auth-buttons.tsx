"use client"

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/shadcn/button"

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
				<Button variant="outline" size="icon" asChild>
					<Link href="/settings">
						<SettingsIcon />
					</Link>
				</Button>

				<UserButton />
			</Authenticated>
		</>
	)
}
