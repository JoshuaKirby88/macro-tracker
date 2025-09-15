"use client"

import { ThemeProvider as BaseThemesProvider } from "next-themes"

export const ThemeProvider = (props: React.ComponentProps<typeof BaseThemesProvider>) => {
	return <BaseThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props} />
}
