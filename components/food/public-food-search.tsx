import { Loader2Icon } from "lucide-react"
import * as React from "react"
import { searchPublicFoodsAction } from "@/actions/food/search-public-foods-action"
import { type PublicFood, PublicFoodItem } from "@/components/food/public-food-item"
import { Button } from "@/components/shadcn/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/shadcn/command"

export type { PublicFood } from "@/components/food/public-food-item"

export const PublicFoodSearch = (props: { onSelect: (food: PublicFood) => void; trigger?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
	const [internalOpen, setInternalOpen] = React.useState(false)
	const isOpen = props.open ?? internalOpen
	const setIsOpen = props.onOpenChange ?? setInternalOpen
	const [searchQuery, setSearchQuery] = React.useState("")
	const [results, setResults] = React.useState<PublicFood[]>([])
	const [isLoading, setIsLoading] = React.useState(false)
	const [debouncedQuery, setDebouncedQuery] = React.useState("")

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery)
		}, 300)
		return () => clearTimeout(handler)
	}, [searchQuery])

	React.useEffect(() => {
		async function search() {
			if (!debouncedQuery.trim()) {
				setResults([])
				setIsLoading(false)
				return
			}
			setIsLoading(true)
			try {
				const data = await searchPublicFoodsAction({ query: debouncedQuery })
				setResults(data.foods.filter((f): f is PublicFood => f.name != null))
			} catch (error) {
				console.error("Search error:", error)
				setResults([])
			} finally {
				setIsLoading(false)
			}
		}
		search()
	}, [debouncedQuery])

	const handleSelect = (food: PublicFood) => {
		props.onSelect(food)
		setIsOpen(false)
		setSearchQuery("")
		setResults([])
	}

	const Trigger = props.trigger ?? (
		<Button variant="outline" className="w-full justify-start gap-2 px-3">
			Search public foods...
		</Button>
	)

	return (
		<>
			<div onClick={() => setIsOpen(true)}>{Trigger}</div>
			<CommandDialog open={isOpen} onOpenChange={setIsOpen} className="w-[35rem]">
				<CommandInput placeholder="Type to search USDA database..." value={searchQuery} onValueChange={setSearchQuery} />
				<CommandList>
					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : results.length === 0 ? (
						<CommandEmpty>{searchQuery.trim() ? "No foods found." : "Type to search..."}</CommandEmpty>
					) : (
						<CommandGroup>
							{results.map((food, index) => (
								<CommandItem key={`${food.name}-${food.brand ?? ""}-${index}`} value={`${food.name} ${food.brand ?? ""}`} className="py-0" onSelect={() => handleSelect(food)}>
									<PublicFoodItem food={food} />
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</CommandDialog>
		</>
	)
}
