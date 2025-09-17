import { CheckIcon } from "lucide-react"
import Image from "next/image"
import type React from "react"
import { capitalize } from "@/utils/capitalize"
import { cn } from "@/utils/cn"
import { GLOBALS } from "@/utils/globals"

export const ImagePreview = ({ fileName, selected, ...props }: { fileName: string; selected?: boolean } & React.ComponentProps<"div">) => {
	const name = fileName
		.split(".")[0]
		.split("-")
		.map((s) => capitalize(s))
		.join(" ")

	return (
		<div
			{...props}
			className={cn(
				"group relative aspect-square w-full cursor-pointer overflow-clip rounded-2xl border border-transparent hover:border-mono-400",
				selected && "border-mono-400",
				props.className,
			)}
		>
			<Image src={GLOBALS.thiings(fileName)} alt={fileName} fill className="transition-all" />
			<div className="absolute inset-0 transition-all group-hover:bg-mono-400/20" />
			{selected && (
				<div className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-mono-1000/60 p-1.5 backdrop-blur-lg">
					<CheckIcon className="stroke-3 text-mono" />
				</div>
			)}
			<div className="absolute inset-x-1 bottom-0 translate-y-[100%] rounded-xl border border-300/30 bg-mono-600/20 p-1.5 text-center font-medium text-xs backdrop-blur-lg transition-all group-hover:bottom-1 group-hover:translate-y-0">
				{name}
			</div>
		</div>
	)
}

export const ImagePreviewSkeleton = () => {
	return <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
}
