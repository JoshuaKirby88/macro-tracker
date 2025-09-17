export const GLOBALS = {
	thiings: (path: string) => `https://thiings.joshuakirby.webcam${path.startsWith("/") ? path : `/${path}`}`,
}
