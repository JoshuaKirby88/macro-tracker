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
import { IMAGE_UPLOAD, isSupportedImageFile, resizeAndConvertToDataUrl } from "@/utils/food/image-upload"

const context = createContext<FileUploadActions | null>(null)

export const FoodFormUploadImage = (props: { form: UseFormReturn<z.infer<typeof updateFoodSchema>> } & React.ComponentProps<"div">) => {
	const [state, actions] = useFileUpload({
		accept: IMAGE_UPLOAD.accept,
		multiple: true,
		onFilesAdded: async (addedFiles) => {
			const toastId = toast.loading("Scanning...")
			try {
				const fileList = addedFiles.map((f) => f.file).filter((f): f is File => f instanceof File)
				if (fileList.length === 0) return

				const supportedFiles = fileList.filter(isSupportedImageFile)
				const unsupportedCount = fileList.length - supportedFiles.length
				if (unsupportedCount > 0) {
					toast.error(`Ignored ${unsupportedCount} unsupported image${unsupportedCount > 1 ? "s" : ""}. ${IMAGE_UPLOAD.supportedMimeTypeError}`, { id: toastId })
				}
				if (supportedFiles.length === 0) return

				const base64Promises = supportedFiles.map((file) => resizeAndConvertToDataUrl(file))
				const base64Results = await Promise.allSettled(base64Promises)
				const base64s = base64Results.filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled").map((r) => r.value)

				if (base64s.length === 0) {
					toast.error("Failed to process images", { id: toastId })
					return
				}

				const result = await analyzeFoodImageAction({ imageBase64s: base64s })

				if (!result.fields) {
					toast.error("No nutrition data detected", { id: toastId })
					return
				}

				const entries = Object.entries(result.fields)
				if (entries.length === 0) {
					toast.error("No nutrition data extracted", { id: toastId })
					return
				}

				for (const [key, value] of entries) {
					if (value !== undefined) {
						props.form.setValue(key as any, value)
					}
				}

				toast.success("Nutrition extracted from image(s)", { id: toastId })
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Image analysis failed"
				toast.error(msg)
			} finally {
				actions.clearFiles()
			}
		},
	})

	return (
		<context.Provider value={actions}>
			<div className="relative" onDragEnter={actions.handleDragEnter} onDragLeave={actions.handleDragLeave} onDragOver={actions.handleDragOver} onDrop={actions.handleDrop} {...props}>
				<input {...actions.getInputProps({ accept: IMAGE_UPLOAD.accept, multiple: true })} className="sr-only" aria-label="Upload image file" tabIndex={-1} />

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
	const actions = useContext(context)
	if (!actions) {
		throw new Error("FoodFormUploadImageButton must be used within FoodFormUploadImage")
	}

	return (
		<Button variant="secondary" onClick={actions.openFileDialog} {...props}>
			<UploadIcon /> Scan image
		</Button>
	)
}
