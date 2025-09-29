import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { Button } from "@/components/shadcn/button"
import { DotsOverlay } from "./dots-overlay"

export type ImagePreviewOverlayProps = {
	previewUrl: string | undefined
	isOpen: boolean
	setIsOpen: (isOpen: boolean) => void
}

export const ImagePreviewOverlay = (props: ImagePreviewOverlayProps) => {
	return (
		<AnimatePresence>
			{props.previewUrl && props.isOpen && (
				<motion.div
					key="overlay"
					className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
					aria-modal="true"
					role="dialog"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
				>
					<Button size="sm" variant="default" onClick={() => props.setIsOpen(false)} className="absolute top-4 right-4 rounded-full">
						Close
					</Button>

					<div className="mx-4 w-full max-w-3xl" style={{ perspective: "1200px" }} onClick={(e) => e.stopPropagation()}>
						<motion.div
							key="card"
							className="relative rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/10 to-slate-900/10 p-3 shadow-[0_25px_120px_-20px_rgba(56,189,248,0.45)]"
							style={{ transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
							initial={{ scale: 0.9, y: 80, rotateX: 16 }}
							animate={{ scale: 1, y: 0, rotateX: 16 }}
							exit={{ scale: 0.85, y: 320, rotateX: 16, opacity: 0.9 }}
							transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
						>
							<div className="relative overflow-hidden rounded-xl" style={{ ["--scan-duration" as any]: "1.6s", ["--scan-timing" as any]: "ease-in-out" }}>
								<Image src={props.previewUrl} alt="Uploaded image preview" width={600} height={600} className="block h-[60vh] w-full rounded-xl object-cover" />

								<DotsOverlay className="absolute inset-0" />

								<div className="-translate-x-1/2 -translate-y-1/2 absolute top-[50%] left-[50%] rounded-full bg-black/80 px-4 py-2 font-medium text-sm">Scanning…</div>
							</div>
						</motion.div>
					</div>

					<motion.div
						key="shadow"
						className="mx-auto mt-8 h-8 w-4/5 rounded-[100%] bg-sky-900/25 blur-lg"
						aria-hidden="true"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.85, y: 60 }}
						transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
