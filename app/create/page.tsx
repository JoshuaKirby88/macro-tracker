"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { XIcon } from "lucide-react"
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
import { Input } from "@/components/shadcn/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import { api } from "@/convex/_generated/api"
import { createFoodSchema } from "@/convex/schema"
import { useFileUpload } from "@/hooks/use-file-upload"
import { toastFormError } from "@/utils/form/toast-form-error"

const config = {
	schema: createFoodSchema.partial().merge(createFoodSchema.pick({ name: true, image: true, servingSize: true, servingUnit: true })),
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
	const form = useForm({ resolver: zodResolver(config.schema), defaultValues: { image: config.defaults.image } })
	const [isScanning, setIsScanning] = useState(false)

	const numericFieldKeys = config.fields.filter((f) => (f as any).isNumber).map((f) => f.value as string)
	const [multiplier, setMultiplier] = useState<number>(1)

	const multiplyFormValues = (factor: number) => {
		if (!Number.isFinite(factor)) return
		for (const key of numericFieldKeys) {
			const currentVal = form.getValues(key as any)
			const num = Number(currentVal)
			if (!Number.isFinite(num)) continue
			form.setValue(key as any, (num * factor) as any, { shouldDirty: true })
		}
	}

	const handleMultiplierChange = (e: any) => {
		const val = parseFloat(e.target.value)
		setMultiplier(Number.isFinite(val) ? val : 1)
		if (Number.isFinite(val)) {
			multiplyFormValues(val)
		}
	}

	const [{ files, isDragging }, { openFileDialog, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop }] = useFileUpload({
		accept: "image/*",
		multiple: true,
		onFilesAdded: async (addedFiles) => {
			setIsScanning(true)
			try {
				const fileList = addedFiles.map((f) => f.file).filter((f): f is File => f instanceof File)
				if (fileList.length === 0) return

				const base64s = await Promise.all(
					fileList.map(
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
					toast.error("No nutrition data detected from images")
					return
				}
				for (const [k, v] of entries) {
					form.setValue(k as any, v as any)
				}
				toast.success(`Extracted nutrition from ${base64s.length} image${base64s.length > 1 ? "s" : ""}`)
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Image analysis failed"
				toast.error(msg)
			} finally {
				setIsScanning(false)
			}
		},
	})

	const inputProps = getInputProps({ accept: "image/*", multiple: true })

	const onSubmit = async (input: z.infer<typeof config.schema>) => {
		try {
			const newFoodId = await createFood({
				...input,
				brand: input.brand ?? "",
				description: input.description ?? "",
				calories: input.calories ?? 0,
				protein: input.protein ?? 0,
				fat: input.fat ?? 0,
				carbs: input.carbs ?? 0,
				sugar: input.sugar ?? 0,
				fiber: input.fiber ?? 0,
			})
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

			<Card className="relative mx-auto w-[50rem] max-w-[95%]">
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

					<CardFooter className="mt-10 justify-between gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="icon" className="rounded-full">
									<XIcon className="stroke-3" />
								</Button>
							</PopoverTrigger>
							<PopoverContent align="end" className="w-80">
								<div className="space-y-3">
									<p className="text-muted-foreground text-sm">Enter a number to multiply all numeric fields currently filled in this form.</p>
									<Input type="number" step="any" value={multiplier} onChange={handleMultiplierChange} />
								</div>
							</PopoverContent>
						</Popover>

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
