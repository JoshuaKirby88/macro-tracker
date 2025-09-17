"use client"

import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { searchThiingsAction } from "@/actions/search-thiings-action"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { Input } from "@/components/shadcn/input"
import { ImagePreview, ImagePreviewSkeleton } from "./image-preview"

const config = {
	topK: 30,
	minScore: 0.2,
	defaultValue: "onigiri.png",
	defaultQuery: "Onigiri",
}

export const ImagePicker = (props: { value: string; onChange: (value: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [value, setValue] = useState(config.defaultValue)
	const [query, setQuery] = React.useState(config.defaultQuery)
	const [debouncedQuery, setDebouncedQuery] = React.useState(config.defaultQuery)

	React.useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
		return () => clearTimeout(t)
	}, [query])

	React.useEffect(() => {
		setValue(props.value)
	}, [props.value])

	const { data, isFetching, isError } = useQuery({
		queryKey: ["image-search", debouncedQuery],
		enabled: debouncedQuery.length > 0,
		queryFn: async () => searchThiingsAction({ query: debouncedQuery, topK: config.topK, minScore: config.minScore }),
	})

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className="size-30">
				<ImagePreview fileName={value} />
			</DialogTrigger>

			<DialogContent className="flex size-[50rem] max-h-[90%] max-w-[95%] flex-col">
				<DialogHeader>
					<DialogTitle>Choose Image</DialogTitle>
				</DialogHeader>

				<Input placeholder="Search images…" value={query} onChange={(e) => setQuery(e.target.value)} />

				<div className="mt-4 flex-1 overflow-auto">
					{isError ? <div className="text-destructive text-sm">Something went wrong. Try again.</div> : null}
					{debouncedQuery.length === 0 ? <div className="text-muted-foreground text-sm">Type to search images.</div> : null}

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{isFetching && Array.from({ length: config.topK }, (_, i) => <ImagePreviewSkeleton key={i} />)}

						{data?.fileNames.map((fileName) => (
							<ImagePreview
								key={fileName}
								fileName={fileName}
								selected={fileName === value}
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
