import { create } from "zustand"

const store = create(() => ({
	selectedDate: new Date(),
}))

export const dateUtil = {
	store,
	getDateString(date: Date) {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")
		return `${year}-${month}-${day}`
	},
}

export const useDateString = (type: "today" | "selected") => {
	if (type === "today") return dateUtil.getDateString(new Date())
	else return store((state) => dateUtil.getDateString(state.selectedDate))
}
