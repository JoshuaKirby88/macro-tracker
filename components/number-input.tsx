import { Input, NumberField } from "react-aria-components"
import { inputVariants } from "./shadcn/input"

export const NumberInput = ({ value, onChange, ...props }: React.ComponentProps<typeof Input> & React.ComponentProps<typeof NumberField>) => {
	return (
		<NumberField value={value} onChange={onChange}>
			<Input {...props} className={inputVariants({ className: props.className })} />
		</NumberField>
	)
}
