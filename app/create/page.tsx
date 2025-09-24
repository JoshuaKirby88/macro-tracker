"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod/v3"
import { analyzeFoodImageAction } from "@/actions/food/analyze-food-image-action"
import { CreateFoodFields } from "@/app/create/_components/create-food-fields"
import { FullscreenDropOverlay } from "@/app/create/_components/fullscreen-drop-overlay"
import { ImagePreviewOverlay } from "@/app/create/_components/image-preview-overlay"
import { UploadActions } from "@/app/create/_components/upload-actions"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card"
import { api } from "@/convex/_generated/api"
import { createFoodSchema } from "@/convex/schema"
import { useFileUpload } from "@/hooks/use-file-upload"
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	fields: [
		{ value: "name" },
		{ value: "brand", isOptional: true },
		{ value: "description", isOptional: true },
		{ value: "servingSize", title: "Serving Size", isNumber: true },
		{ value: "servingUnit", title: "Serving Unit" },
		{ value: "calories", isNumber: true },
		{ value: "protein", isNumber: true, isGram: true },
		{ value: "fat", isNumber: true, isGram: true },
		{ value: "carbs", isNumber: true, isGram: true },
		{ value: "fiber", isNumber: true, isGram: true },
		{ value: "sugar", isNumber: true, isGram: true },
	] satisfies React.ComponentProps<typeof CreateFoodFields>["fields"],
	defaults: {
		image: "onigiri.png",
		imageQuery: "Onigiri",
	},
}

const Page = () => {
	const router = useRouter()
	const createFood = useMutation(api.foods.create)
	const form = useForm({ resolver: zodResolver(createFoodSchema), defaultValues: { image: config.defaults.image, fiber: 0, sugar: 0 } })
	const [isScanning, setIsScanning] = useState(false)

	const [{ files, isDragging }, { openFileDialog, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop }] = useFileUpload({
		accept: "image/*",
		onFilesAdded: async (addedFiles) => {
			setIsScanning(true)
			try {
				const first = addedFiles[0]?.file
				if (!(first instanceof File)) return
				const base64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader()
					reader.onload = () => resolve(reader.result as string)
					reader.onerror = () => reject(new Error("Failed to read image"))
					reader.readAsDataURL(first)
				})
				const result = await analyzeFoodImageAction({ imageBase64: base64 })
				const entries = Object.entries(result.fields)
				if (entries.length === 0) {
					toast.error("No nutrition data detected from image")
					return
				}
				for (const [k, v] of entries) {
					form.setValue(k as any, v as any)
				}
				setIsScanning(false)
				toast.success("Extracted nutrition from image")
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Image analysis failed"
				toast.error(msg)
			}
		},
	})

	const inputProps = getInputProps({ accept: "image/*", multiple: false })

	const onSubmit = async (input: z.infer<typeof createFoodSchema>) => {
		try {
			const newFoodId = await createFood(input)
			toast.success("Food created")
			router.push(`/?newFoodId=${newFoodId}`)
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Something went wrong")
		}
	}

	return (
		<div className="relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
			<ImagePreviewOverlay previewUrl={files[0]?.preview} isOpen={isScanning} setIsOpen={() => setIsScanning(false)} />

			<FullscreenDropOverlay isDragging={isDragging} dragHandlers={{ onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop }} />

			<Card className="mx-auto w-[50rem] max-w-[95%]">
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div>
						<CardTitle>Create food</CardTitle>
						<CardDescription>Add a custom food with serving and macros.</CardDescription>
					</div>
					<UploadActions inputProps={inputProps} onClickUpload={openFileDialog} />
				</CardHeader>

				<form onSubmit={form.handleSubmit(onSubmit, toastFormError)}>
					<CardContent className="grid gap-4">
						<CreateFoodFields control={form.control} register={form.register} fields={config.fields} getDefaultQueryOnOpen={() => form.getValues("name") ?? config.defaults.imageQuery} />
					</CardContent>

					<CardFooter className="justify-end gap-2">
						<Button type="submit" isLoading={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Creating…" : "Create food"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}

export default Page
