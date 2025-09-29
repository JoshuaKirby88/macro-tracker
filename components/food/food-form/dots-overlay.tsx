"use client"

import { motion } from "motion/react"
import { useMemo } from "react"
import { cn } from "@/utils/cn"

export const DotsOverlay = (props: React.ComponentProps<typeof motion.div>) => {
	const seed = useMemo(() => Math.floor(Math.random() * 100000), [])
	const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' seed='${seed}'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='table' tableValues='0 0 1 1'/><feFuncG type='table' tableValues='0 0 1 1'/><feFuncB type='table' tableValues='0 0 1 1'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
	const noiseDataUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}')`

	return (
		<motion.div
			{...props}
			className={cn("pointer-events-none", props.className)}
			initial={{ ["--y" as any]: "0%" }}
			animate={{ ["--y" as any]: "100%" }}
			transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
			style={
				{
					WebkitMaskImage: `linear-gradient(to bottom, transparent calc(var(--y) - var(--band)/2), white calc(var(--y) - var(--band)/2), white calc(var(--y) + var(--band)/2), transparent calc(var(--y) + var(--band)/2)), ${noiseDataUrl}`,
					maskImage: `linear-gradient(to bottom, transparent calc(var(--y) - var(--band)/2), white calc(var(--y) - var(--band)/2), white calc(var(--y) + var(--band)/2), transparent calc(var(--y) + var(--band)/2)), ${noiseDataUrl}`,
					WebkitMaskRepeat: "no-repeat, repeat",
					maskRepeat: "no-repeat, repeat",
					WebkitMaskSize: "100% 100%, 16px 16px",
					maskSize: "100% 100%, 16px 16px",
					WebkitMaskComposite: "source-in",
					maskComposite: "intersect",
					["--band" as any]: "20%",
				} as any
			}
		>
			<div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:8px_8px]" />
		</motion.div>
	)
}
