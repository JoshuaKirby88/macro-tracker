export const dateFormatter = {
	getLocalDateString(date: Date) {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")
		return `${year}-${month}-${day}`
	},
	dateStringToRange(str: string) {
		const [yearStr, monthStr, dayStr] = str.split("-")
		const year = Number(yearStr)
		const month = Number(monthStr) - 1 // zero-based
		const day = Number(dayStr)
		if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
			throw new Error("Invalid forDate; expected YYYY-MM-DD")
		}
		const startMs = Date.UTC(year, month, day)
		const endMs = Date.UTC(year, month, day + 1)
		return { startMs, endMs }
	},
}
