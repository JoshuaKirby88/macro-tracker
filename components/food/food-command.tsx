import { useQuery } from "convex/react"
import { SearchIcon } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { Button } from "@/components/shadcn/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/shadcn/command"
import { api } from "@/convex/_generated/api"
import type { Food } from "@/convex/schema"
import { GLOBALS } from "@/utils/globals"

export const FoodCommand = (props: { foodId: Food["_id"]; onChange: (foodId: Food["_id"]) => void; onSelect?: () => void }) => {
	const foods = useQuery(api.foods.forUser, {})
	const [isOpen, setIsOpen] = React.useState(false)
	const [inputValue, setInputValue] = React.useState("")
	const selectedFood = foods?.find((f) => f._id === props.foodId)
	const sortedFoods = React.useMemo(() => (foods ? [...foods].sort((a, b) => b.touchedAt - a.touchedAt) : []), [foods])
	const listRef = React.useRef<HTMLDivElement | null>(null)

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setIsOpen((open) => !open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	return (
		<>
			<Button variant="outline" className="relative flex w-full justify-start px-3 text-sm" onClick={() => setIsOpen(true)} title="Select food (⌘K)" aria-label="Select food (⌘K)">
				{selectedFood ? (
					<>
						<Image src={GLOBALS.thiings(selectedFood.image)} alt={selectedFood.name} width={20} height={20} />
						<span className="truncate">{`${selectedFood.name}${selectedFood.brand ? ` (${selectedFood.brand})` : ""} — ${selectedFood.servingSize} ${selectedFood.servingUnit}`}</span>
					</>
				) : (
					<span className="flex w-full items-center gap-2 text-muted-foreground">
						<SearchIcon />
						Search foods...
						<kbd className="ml-auto hidden items-center rounded border px-1 font-[inherit] text-xs md:flex">⌘K</kbd>
					</span>
				)}
			</Button>

			<CommandDialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)} className="w-[35rem]">
				<CommandInput
					className="text-base"
					placeholder="Type to search foods…"
					value={inputValue}
					onValueChange={(v) => {
						setInputValue(v)
						if (listRef.current) {
							listRef.current.scrollTop = 0
						}
					}}
				/>
				<CommandList ref={listRef}>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup>
						{sortedFoods.map((food) => (
							<CommandItem
								key={food._id}
								value={[food.name, food.brand, food.description, ...food.image.split("-"), food._id].join(" ")}
								className="py-0"
								onSelect={() => {
									props.onChange(food._id)
									setIsOpen(false)
									props.onSelect?.()
								}}
							>
								<Image src={GLOBALS.thiings(food.image)} alt={food.name} width={40} height={40} />
								{food.name}
								{food.brand ? ` (${food.brand})` : ""} — {food.servingSize} {food.servingUnit}
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	)
}
