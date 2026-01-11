"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, CopyIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Checkbox } from "@/components/shadcn/checkbox"
import { Label } from "@/components/shadcn/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import { api } from "@/convex/_generated/api"
import { dateUtil } from "@/utils/date-util"
import { entryUtil } from "@/utils/entry-util"
import { exportUtil, type NutritionField } from "@/utils/export-util"
import { toast } from "sonner"

export default function ExportPage() {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: today, to: today })
	const [selectedMeals, setSelectedMeals] = useState<Set<"breakfast" | "lunch" | "dinner">>(new Set())
	const [selectedNutrition, setSelectedNutrition] = useState<Set<NutritionField>>(new Set(["calories", "protein", "fat", "carbs"]))

	const startDate = dateRange?.from || today
	const endDate = dateRange?.to || dateRange?.from || today
	const startDateString = dateUtil.getDateString(startDate)
	const endDateString = dateUtil.getDateString(endDate)

	const entriesData = useQuery(api.entries.withFoodsForDateRange, {
		startDate: startDateString,
		endDate: endDateString,
	})

	// Set default meals based on entries that have at least 1 entry
	const hasInitializedMeals = useMemo(() => selectedMeals.size > 0, [selectedMeals.size])
	useEffect(() => {
		if (entriesData?.entries && !hasInitializedMeals) {
			const mealsWithEntries = new Set<"breakfast" | "lunch" | "dinner">()
			for (const entry of entriesData.entries) {
				mealsWithEntries.add(entry.mealType)
			}
			if (mealsWithEntries.size > 0) {
				setSelectedMeals(mealsWithEntries)
			}
		}
	}, [entriesData?.entries, hasInitializedMeals])

	const markdown = useMemo(() => {
		if (!entriesData?.entries || !entriesData?.foods) return ""

		return exportUtil.generateMarkdown({
			entries: entriesData.entries,
			foods: entriesData.foods,
			selectedMeals: Array.from(selectedMeals),
			selectedNutrition: Array.from(selectedNutrition),
		})
	}, [entriesData, selectedMeals, selectedNutrition])

	const handleMealToggle = (mealType: "breakfast" | "lunch" | "dinner") => {
		setSelectedMeals((prev) => {
			const next = new Set(prev)
			if (next.has(mealType)) {
				next.delete(mealType)
			} else {
				next.add(mealType)
			}
			return next
		})
	}

	const handleNutritionToggle = (field: NutritionField) => {
		setSelectedNutrition((prev) => {
			const next = new Set(prev)
			if (next.has(field)) {
				next.delete(field)
			} else {
				next.add(field)
			}
			return next
		})
	}

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(markdown)
			toast.success("Markdown copied to clipboard")
		} catch (error) {
			toast.error("Failed to copy to clipboard")
		}
	}

	const handleDownload = () => {
		const blob = new Blob([markdown], { type: "text/markdown" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `food-export-${startDateString}-to-${endDateString}.md`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		toast.success("Markdown file downloaded")
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 p-4 pb-30">
			<Card>
				<CardHeader>
					<CardTitle>Export Food Entries</CardTitle>
					<CardDescription>Export your food entries as markdown to share with ChatGPT or other tools.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Date Range */}
					<div className="space-y-4">
						<Label>Date Range</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-full justify-start text-left font-normal">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
											</>
										) : (
											format(dateRange.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
							</PopoverContent>
						</Popover>
					</div>

					{/* Meal Types */}
					<div className="space-y-3">
						<Label>Meals</Label>
						<div className="flex flex-wrap gap-4">
							{entryUtil.mealTypes.map((mealType) => (
								<div key={mealType} className="flex items-center gap-2">
									<Checkbox checked={selectedMeals.has(mealType)} onCheckedChange={() => handleMealToggle(mealType)} id={`meal-${mealType}`} />
									<Label htmlFor={`meal-${mealType}`} className="cursor-pointer capitalize">
										{mealType}
									</Label>
								</div>
							))}
						</div>
					</div>

					{/* Nutritional Information */}
					<div className="space-y-3">
						<Label>Nutritional Information</Label>
						<div className="flex flex-wrap gap-4">
							{(Object.keys(exportUtil.nutritionLabels) as NutritionField[]).map((field) => (
								<div key={field} className="flex items-center gap-2">
									<Checkbox checked={selectedNutrition.has(field)} onCheckedChange={() => handleNutritionToggle(field)} id={`nutrition-${field}`} />
									<Label htmlFor={`nutrition-${field}`} className="cursor-pointer">
										{exportUtil.nutritionLabels[field]}
									</Label>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Markdown Output */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Markdown Output</CardTitle>
						<CardDescription>Preview and copy your exported data</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={handleCopy} disabled={!markdown}>
							<CopyIcon className="h-4 w-4" />
							Copy
						</Button>
						<Button variant="outline" size="sm" onClick={handleDownload} disabled={!markdown}>
							<DownloadIcon className="h-4 w-4" />
							Download
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{entriesData === undefined ? (
						<div className="text-muted-foreground text-sm">Loading entries...</div>
					) : entriesData === null ? (
						<div className="text-muted-foreground text-sm">Please sign in to export your entries.</div>
					) : markdown ? (
						<pre className="max-h-[600px] overflow-auto rounded-md border bg-muted p-4 text-sm">
							<code>{markdown}</code>
						</pre>
					) : (
						<div className="text-muted-foreground text-sm">No entries found for the selected criteria.</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
