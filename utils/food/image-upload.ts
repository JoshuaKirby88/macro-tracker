const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const

export const IMAGE_UPLOAD = {
	accept: supportedImageMimeTypes.join(","),
	supportedMimeTypeSet: new Set<string>(supportedImageMimeTypes),
	supportedMimeTypeError: "Please upload JPEG, PNG, WEBP, or GIF.",
	maxDimension: 2048,
	maxFileSize: 10 * 1024 * 1024, // 10MB
}

const fileNamePattern = /\.(jpe?g|png|webp|gif)$/i

export const isSupportedImageDataUrl = (value: string) => {
	const match = /^data:([^;]+);base64,/i.exec(value)
	if (!match) return false
	return IMAGE_UPLOAD.supportedMimeTypeSet.has(match[1].toLowerCase())
}

export const isSupportedImageFile = (file: File) => IMAGE_UPLOAD.supportedMimeTypeSet.has(file.type) || fileNamePattern.test(file.name)

export const toDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(new Error("Failed to read image"))
		reader.readAsDataURL(file)
	})

const getOutputType = (mimeType: string): string => {
	if (mimeType === "image/png") return "image/png"
	return "image/jpeg"
}

const ANALYSIS_MAX_DIMENSION = 1024
const ANALYSIS_JPEG_QUALITY = 0.75

export const resizeForAnalysis = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			const maxDim = ANALYSIS_MAX_DIMENSION
			let width = img.width
			let height = img.height

			if (width > maxDim || height > maxDim) {
				if (width > height) {
					height = Math.round((height * maxDim) / width)
					width = maxDim
				} else {
					width = Math.round((width * maxDim) / height)
					height = maxDim
				}
			}

			const canvas = document.createElement("canvas")
			canvas.width = width
			canvas.height = height
			const ctx = canvas.getContext("2d")
			if (!ctx) {
				reject(new Error("Failed to get canvas context"))
				return
			}
			ctx.drawImage(img, 0, 0, width, height)

			const outputType = getOutputType(file.type)
			const quality = outputType === "image/jpeg" ? ANALYSIS_JPEG_QUALITY : undefined
			const dataUrl = canvas.toDataURL(outputType, quality)
			resolve(dataUrl)
		}
		img.onerror = () => reject(new Error("Failed to load image"))
		img.src = URL.createObjectURL(file)
	})
