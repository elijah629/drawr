"use client";

import { Canvas } from "@/components/Canvas";
import { HelpButton } from "@/components/HelpButton";
import { SimpleColorPicker } from "@/components/SimpleColorPicker";
import { socket } from "@/lib/socket";
import { useRef, useState } from "react";

export default function Home() {
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const [cX, setCX] = useState(0);
	const [cY, setCY] = useState(0);
	const [scale, setScale] = useState(1);

	const colorRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Canvas
				onChange={(x, y, scale, canvasX, canvasY) => {
					setX(x);
					setY(y);
					setCX(canvasX);
					setCY(canvasY);
					setScale(scale);
				}}
				onClick={(x, y, ref) => {
					const canvas = ref.current!;
					const context = canvas.getContext("2d")!;

					context.fillStyle = colorRef.current!.value;
					context.fillRect(x, y, 1, 1);

					socket.emit("set", {
						x,
						y,
						color: colorRef.current!.value
					});
				}}
				onCanvas={ref => {
					socket.on(
						"set",
						(args: { x: number; y: number; color: string }) => {
							const canvas = ref.current!;
							const context = canvas.getContext("2d")!;
							context.fillStyle = args.color;
							context.fillRect(args.x, args.y, 1, 1);
						}
					);
				}}
			/>
			<div className="pointer-events-none fixed inset-0 z-10 grid h-full grid-cols-[35px,1fr,200px,1fr,35px] grid-rows-[35px,1fr,35px] p-2 [&>*]:pointer-events-auto">
				<div className="pill col-start-3 row-start-1">
					({x}, {y}) {scale.toFixed(2)}x
				</div>
				<button className="icon-button col-start-1 row-start-1">
					<SimpleColorPicker ref={colorRef} />
				</button>
				{/* <div className="pill col-start-3 row-start-3">0:00</div> */}
				<HelpButton />
			</div>
			<div className="pointer-events-none fixed inset-0 h-full overflow-hidden">
				<div
					className="absolute opacity-50"
					style={{
						backgroundColor: colorRef.current?.value,
						width: scale,
						height: scale,
						left: x * scale + cX,
						top: y * scale + cY
					}}></div>
			</div>
		</>
	);
}
