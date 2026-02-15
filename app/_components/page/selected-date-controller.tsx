"use client"

import { useHotkeySequence } from "@tanstack/react-hotkeys"
import { addDays, format } from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { KeyBadge } from "@/components/key-badge"
import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import { cn } from "@/utils/cn"
import { dateUtil } from "@/utils/date-util"
import { getKeyLabel, getSequenceLabel, shortcuts } from "@/utils/shortcuts-config"

export const SelectedDateController = () => {
	const selectedDate = dateUtil.store((state) => state.selectedDate)
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)

	const setDate = useCallback((date: Date) => dateUtil.store.setState({ selectedDate: date }), [])
	const goToPreviousDay = useCallback(() => setDate(addDays(selectedDate, -1)), [selectedDate, setDate])
	const goToNextDay = useCallback(() => setDate(addDays(selectedDate, 1)), [selectedDate, setDate])
	const goToToday = useCallback(() => setDate(new Date()), [setDate])

	useHotkeySequence([...shortcuts.date.prevDay.sequence], goToPreviousDay)
	useHotkeySequence([...shortcuts.date.nextDay.sequence], goToNextDay)
	useHotkeySequence([...shortcuts.date.today.sequence], goToToday)
	useHotkeySequence([...shortcuts.date.calendar.sequence], () => setIsCalendarOpen(true))

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={goToPreviousDay}
				className="relative"
				title={`Previous day (${getSequenceLabel(shortcuts.date.prevDay.sequence)})`}
				aria-label={`Previous day (${getSequenceLabel(shortcuts.date.prevDay.sequence)})`}
			>
				<ChevronLeftIcon />
				<KeyBadge label={getKeyLabel(shortcuts.date.prevDay.sequence[1])} />
			</Button>

			<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="group relative w-[180px] justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
						title={`Open calendar (${getSequenceLabel(shortcuts.date.calendar.sequence)})`}
						aria-label={`Open calendar (${getSequenceLabel(shortcuts.date.calendar.sequence)})`}
					>
						<span className={cn("truncate", !selectedDate && "text-muted-foreground")}>{selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}</span>
						<CalendarIcon className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground" aria-hidden="true" />
						<KeyBadge label={getKeyLabel(shortcuts.date.calendar.sequence[1])} />
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
				title={`Jump to today (${getSequenceLabel(shortcuts.date.today.sequence)})`}
				aria-label={`Jump to today (${getSequenceLabel(shortcuts.date.today.sequence)})`}
			>
				Today
				<KeyBadge label={getKeyLabel(shortcuts.date.today.sequence[1])} />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={goToNextDay}
				className="relative"
				title={`Next day (${getSequenceLabel(shortcuts.date.nextDay.sequence)})`}
				aria-label={`Next day (${getSequenceLabel(shortcuts.date.nextDay.sequence)})`}
			>
				<ChevronRightIcon />
				<KeyBadge label={getKeyLabel(shortcuts.date.nextDay.sequence[1])} />
			</Button>
		</div>
	)
}
