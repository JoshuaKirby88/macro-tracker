const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const

export const IMAGE_UPLOAD = {
	accept: supportedImageMimeTypes.join(","),
	supportedMimeTypeSet: new Set<string>(supportedImageMimeTypes),
	supportedMimeTypeError: "Please upload JPEG, PNG, WEBP, or GIF.",
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
