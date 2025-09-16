import localFont from "next/font/local"

export const SFProRoundedSemibold = localFont({
	src: "./SF-Pro-Rounded-Semibold.woff2",
	display: "swap",
	fallback: ["Arial Rounded MT Bold", "Helvetica", "sans-serif"],
	weight: "1000",
})
