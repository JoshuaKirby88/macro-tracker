import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { searchThiingsAction } from "@/actions/search-thiings-action"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { Input } from "@/components/shadcn/input"
import { ImagePreview, ImagePreviewSkeleton } from "./image-preview"

const config = {
	topK: 100,
	minScore: 0.2,
}

export const ImagePicker = (props: { value: string; onChange: (value: string) => void; getDefaultQueryOnOpen: () => string }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = React.useState(props.getDefaultQueryOnOpen())
	const [debouncedQuery, setDebouncedQuery] = React.useState(props.getDefaultQueryOnOpen())
	const resultsRef = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
		return () => clearTimeout(t)
	}, [query])

	React.useEffect(() => {
		const defaultQuery = props.getDefaultQueryOnOpen()
		if (isOpen && defaultQuery) {
			setQuery(defaultQuery)
			setDebouncedQuery(defaultQuery)
		}
	}, [isOpen, props.getDefaultQueryOnOpen])

	const { data, isFetching, isError } = useQuery({
		queryKey: ["image-search", debouncedQuery],
		enabled: isOpen && debouncedQuery.length > 0,
		queryFn: async () => {
			const result = await searchThiingsAction({ query: debouncedQuery, topK: config.topK, minScore: config.minScore })
			if (resultsRef.current) resultsRef.current.scrollTop = 0
			return result
		},
	})

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className="size-30">
				<ImagePreview fileName={props.value} />
			</DialogTrigger>

			<DialogContent className="flex size-[50rem] max-h-[90%] max-w-[95%] flex-col">
				<DialogHeader>
					<DialogTitle>Choose Image</DialogTitle>
					<p className="text-muted-foreground text-xs">
						Images from{" "}
						<a href="https://www.thiings.co/things" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
							thiings
						</a>
					</p>
				</DialogHeader>

				<Input placeholder="Search images…" value={query} onChange={(e) => setQuery(e.target.value)} />

				<div ref={resultsRef} className="mt-4 flex-1 overflow-auto">
					{isError ? <div className="text-destructive text-sm">Something went wrong. Try again.</div> : null}

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{isFetching && Array.from({ length: config.topK }, (_, i) => <ImagePreviewSkeleton key={i} />)}

						{data?.fileNames.map((fileName) => (
							<ImagePreview
								key={fileName}
								fileName={fileName}
								selected={fileName === props.value}
								onClick={() => {
									props.onChange(fileName)
									setIsOpen(false)
								}}
							/>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
