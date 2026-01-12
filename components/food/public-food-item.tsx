import { cn } from "@/utils/cn"

export type PublicFood = {
	name: string
	brand?: string
	description?: string
	servingSize?: number
	servingUnit?: string
	calories?: number
	protein?: number
	fat?: number
	carbs?: number
	fiber?: number
	sugar?: number
}

export const PublicFoodItem = (props: { food: PublicFood; className?: string }) => {
	const { food } = props
	const { name, brand, servingSize = 100, servingUnit = "g", calories, protein, fat, carbs } = food

	return (
		<div className={cn("flex w-full items-center justify-between gap-3", props.className)}>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="truncate font-medium">{name}</div>
				{brand && <div className="truncate text-muted-foreground text-xs">{brand}</div>}
				<div className="text-muted-foreground text-xs">
					{servingSize} {servingUnit}
				</div>
			</div>
			<div className="flex shrink-0 gap-3 text-xs">
				{calories != null && (
					<div className="flex flex-col items-center">
						<span className="font-medium">{Math.round(calories)}</span>
						<span className="text-[10px] text-muted-foreground">cal</span>
					</div>
				)}
				{protein != null && (
					<div className="flex flex-col items-center">
						<span className="font-medium">{Math.round(protein)}g</span>
						<span className="text-[10px] text-muted-foreground">pro</span>
					</div>
				)}
				{fat != null && (
					<div className="flex flex-col items-center">
						<span className="font-medium">{Math.round(fat)}g</span>
						<span className="text-[10px] text-muted-foreground">fat</span>
					</div>
				)}
				{carbs != null && (
					<div className="flex flex-col items-center">
						<span className="font-medium">{Math.round(carbs)}g</span>
						<span className="text-[10px] text-muted-foreground">carb</span>
					</div>
				)}
			</div>
		</div>
	)
}
