"use client"

import { addDays, format } from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover"
import { cn } from "@/utils/cn"
import { dateUtil } from "@/utils/date-util"

export const SelectedDateController = () => {
	const selectedDate = dateUtil.store((state) => state.selectedDate)
	const setDate = (date: Date) => dateUtil.store.setState({ selectedDate: date })

	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" size="icon" onClick={() => setDate(addDays(selectedDate, -1))}>
				<ChevronLeftIcon className="size-4" />
			</Button>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="group w-[180px] justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
					>
						<span className={cn("truncate", !selectedDate && "text-muted-foreground")}>{selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}</span>
						<CalendarIcon className="size-4 shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground" aria-hidden="true" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2">
					<Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setDate(d)} />
				</PopoverContent>
			</Popover>

			<Button variant="outline" size="icon" onClick={() => setDate(addDays(selectedDate, 1))}>
				<ChevronRightIcon className="size-4" />
			</Button>
		</div>
	)
}
