"use client"

import { UploadIcon } from "lucide-react"
import { createContext, useContext } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { analyzeFoodImageAction } from "@/actions/food/analyze-food-image-action"
import { FullscreenDropOverlay } from "@/components/food/food-form/fullscreen-drop-overlay"
import { Button } from "@/components/shadcn/button"
import type { updateFoodSchema } from "@/convex/schema"
import { type FileUploadActions, useFileUpload } from "@/hooks/use-file-upload"

const context = createContext<FileUploadActions | null>(null)

export const FoodFormUploadImage = (props: { form: UseFormReturn<z.infer<typeof updateFoodSchema>> } & React.ComponentProps<"div">) => {
	const [state, actions] = useFileUpload({
		accept: "image/jpeg,image/png,image/webp,image/gif",
		multiple: true,
		onFilesAdded: async (addedFiles) => {
			const toastId = toast.loading("Scanning...")
			try {
				const fileList = addedFiles.map((f) => f.file).filter((f): f is File => f instanceof File)
				if (fileList.length === 0) return

				const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
				const supportedFiles = fileList.filter((file) => allowedTypes.has(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name))
				const unsupportedCount = fileList.length - supportedFiles.length
				if (unsupportedCount > 0) {
					toast.error(`Ignored ${unsupportedCount} unsupported image${unsupportedCount > 1 ? "s" : ""}. Please upload JPEG, PNG, WEBP, or GIF.`, { id: toastId })
				}
				if (supportedFiles.length === 0) return

				const base64s = await Promise.all(
					supportedFiles.map(
						(file) =>
							new Promise<string>((resolve, reject) => {
								const reader = new FileReader()
								reader.onload = () => resolve(reader.result as string)
								reader.onerror = () => reject(new Error("Failed to read image"))
								reader.readAsDataURL(file)
							}),
					),
				)

				const result = await analyzeFoodImageAction({ imageBase64s: base64s })
				const entries = Object.entries(result.fields)
				if (entries.length === 0) {
					toast.error("No nutrition data detected from images", { id: toastId })
					return
				}
				for (const [k, v] of entries) {
					props.form.setValue(k as any, v as any)
				}
				toast.success(`Extracted nutrition from ${base64s.length} image${base64s.length > 1 ? "s" : ""}`, { id: toastId })
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Image analysis failed"
				toast.error(msg, { id: toastId })
			}
		},
	})

	return (
		<context.Provider value={actions}>
			<div className="relative" onDragEnter={actions.handleDragEnter} onDragLeave={actions.handleDragLeave} onDragOver={actions.handleDragOver} onDrop={actions.handleDrop} {...props}>
				<input {...actions.getInputProps({ accept: "image/jpeg,image/png,image/webp,image/gif", multiple: true })} className="sr-only" aria-label="Upload image file" tabIndex={-1} />

				{/*<ImagePreviewOverlay previewUrl={state.files[0]?.preview} isOpen={isScanning} setIsOpen={() => setIsScanning(false)} />*/}

				<FullscreenDropOverlay
					isDragging={state.isDragging}
					dragHandlers={{ onDragEnter: actions.handleDragEnter, onDragLeave: actions.handleDragLeave, onDragOver: actions.handleDragOver, onDrop: actions.handleDrop }}
				/>

				{props.children}
			</div>
		</context.Provider>
	)
}

export const FoodFormUploadImageButton = (props: React.ComponentProps<typeof Button>) => {
	const actions = useContext(context)!

	return (
		<Button variant="secondary" onClick={actions.openFileDialog} {...props}>
			<UploadIcon /> Scan image
		</Button>
	)
}
