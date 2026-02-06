"use client"

import { addDays, format } from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { KeyBadge } from "@/components/key-badge"
import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import { cn } from "@/utils/cn"
import { dateUtil } from "@/utils/date-util"
import { getShortcutLabel, useLeaderShortcut } from "@/utils/shortcuts"

const shortcutKeys = {
	prev: "ArrowLeft",
	next: "ArrowRight",
	today: "t",
	calendar: "c",
}

export const SelectedDateController = () => {
	const selectedDate = dateUtil.store((state) => state.selectedDate)
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)

	const setDate = useCallback((date: Date) => dateUtil.store.setState({ selectedDate: date }), [])
	const goToPreviousDay = useCallback(() => setDate(addDays(selectedDate, -1)), [selectedDate, setDate])
	const goToNextDay = useCallback(() => setDate(addDays(selectedDate, 1)), [selectedDate, setDate])
	const goToToday = useCallback(() => setDate(new Date()), [setDate])

	useLeaderShortcut([
		{ key: shortcutKeys.prev, handler: goToPreviousDay },
		{ key: shortcutKeys.next, handler: goToNextDay },
		{ key: shortcutKeys.today, handler: goToToday },
		{ key: shortcutKeys.calendar, handler: () => setIsCalendarOpen(true) },
	])

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={goToPreviousDay}
				className="relative"
				title={`Previous day (${getShortcutLabel("←")})`}
				aria-label={`Previous day (${getShortcutLabel("←")})`}
			>
				<ChevronLeftIcon />
				<KeyBadge label="←" />
			</Button>

			<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="group relative w-[180px] justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
						title={`Open calendar (${getShortcutLabel(shortcutKeys.calendar)})`}
						aria-label={`Open calendar (${getShortcutLabel(shortcutKeys.calendar)})`}
					>
						<span className={cn("truncate", !selectedDate && "text-muted-foreground")}>{selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}</span>
						<CalendarIcon className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground" aria-hidden="true" />
						<KeyBadge label={shortcutKeys.calendar} />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(d) => {
							if (!d) return
							setDate(d)
							setIsCalendarOpen(false)
						}}
					/>
				</PopoverContent>
			</Popover>

			<Button
				variant="outline"
				size="sm"
				onClick={goToToday}
				className="relative"
				title={`Jump to today (${getShortcutLabel(shortcutKeys.today)})`}
				aria-label={`Jump to today (${getShortcutLabel(shortcutKeys.today)})`}
			>
				Today
				<KeyBadge label={shortcutKeys.today} />
			</Button>

			<Button variant="outline" size="icon" onClick={goToNextDay} className="relative" title={`Next day (${getShortcutLabel("→")})`} aria-label={`Next day (${getShortcutLabel("→")})`}>
				<ChevronRightIcon />
				<KeyBadge label="→" />
			</Button>
		</div>
	)
}
