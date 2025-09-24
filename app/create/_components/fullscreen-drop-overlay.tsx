"use client"

import Image from "next/image"
import type React from "react"

type Props = {
	isDragging: boolean
	dragHandlers: {
		onDragEnter: React.DragEventHandler<HTMLElement>
		onDragLeave: React.DragEventHandler<HTMLElement>
		onDragOver: React.DragEventHandler<HTMLElement>
		onDrop: React.DragEventHandler<HTMLElement>
	}
	label?: string
	className?: string
}

export const FullscreenDropOverlay: React.FC<Props> = ({ isDragging, dragHandlers, label = "Drop image to upload", className }) => {
	if (!isDragging) return null

	return (
		<div
			className={["fixed inset-0 z-40 flex items-center justify-center border-2 border-dashed", "border-sky-400/40 bg-sky-500/10 backdrop-blur-sm", className].filter(Boolean).join(" ")}
			onDragEnter={dragHandlers.onDragEnter}
			onDragLeave={dragHandlers.onDragLeave}
			onDragOver={dragHandlers.onDragOver}
			onDrop={dragHandlers.onDrop}
			aria-label={label}
		>
			<div className="mx-4 w-full max-w-xl rounded-xl border-2 border-sky-400/40 border-dashed bg-sky-50/80 px-6 py-5 text-center text-sky-800 shadow-md backdrop-blur-md sm:px-10 sm:py-8">
				<div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
					<Image src="/thiings/image-to-text.png" alt="Drop image" width={100} height={100} className="h-20 w-auto sm:h-28 md:h-36" />
					<p className="text-base sm:text-lg">{label}</p>
				</div>
			</div>
		</div>
	)
}
