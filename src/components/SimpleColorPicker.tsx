"use client";

import { ForwardedRef, forwardRef, useState } from "react";

export const SimpleColorPicker = forwardRef(function SimpleColorPicker(
	props: any,
	ref: ForwardedRef<HTMLInputElement>
) {
	const [color, setColor] = useState<string>("#000");

	return (
		<>
			<div
				style={{
					background: color
				}}
				className="h-full w-full rounded-full">
				<input
					type="color"
					ref={ref}
					className="h-full w-full opacity-0"
					onChange={e => setColor(e.target.value)}
				/>
			</div>
		</>
	);
});
