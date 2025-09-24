import { Upload } from "lucide-react"
import type { InputHTMLAttributes } from "react"
import { Button } from "@/components/shadcn/button"

export type UploadActionsProps = {
	inputProps: InputHTMLAttributes<HTMLInputElement>
	onClickUpload: () => void
}

export const UploadActions = ({ inputProps, onClickUpload }: UploadActionsProps) => {
	return (
		<div className="flex items-center gap-2">
			<input {...inputProps} className="sr-only" aria-label="Upload image file" tabIndex={-1} />
			<Button variant="secondary" type="button" onClick={onClickUpload}>
				<Upload className="mr-2 size-4" /> Upload image
			</Button>
		</div>
	)
}
