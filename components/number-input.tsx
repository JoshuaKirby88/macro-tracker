import { Input, NumberField } from "react-aria-components"
import { inputVariants } from "./shadcn/input"

export const NumberInput = (props: React.ComponentProps<typeof NumberField>) => {
	return (
		<NumberField {...props}>
			<Input className={inputVariants({ className: props.className })} />
		</NumberField>
	)
}
