"use client";

import { Canvas } from "@/components/Canvas";
import { HelpButton } from "@/components/HelpButton";
import { SimpleColorPicker } from "@/components/SimpleColorPicker";
import { useEffect, useRef, useState } from "react";
import "./page.css";

export default function Home() {
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const [cX, setCX] = useState(0);
	const [cY, setCY] = useState(0);
	const [scale, setScale] = useState(1);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const colorRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const source = new EventSource("/pixel/events");
		source.addEventListener("message", ev => {
			const data = JSON.parse(ev.data);

			const canvas = canvasRef.current!;
			const context = canvas.getContext("2d")!;
			context.fillStyle = `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`;
			context.fillRect(data.x, data.y, 1, 1);
		});
	}, []);

	return (
		<>
			<Canvas
				ref={canvasRef}
				onChange={(x, y, scale, canvasX, canvasY) => {
					setX(x);
					setY(y);
					setCX(canvasX);
					setCY(canvasY);
					setScale(scale);
				}}
				onClick={(x, y) => {
					const [r, g, b] = colorRef
						.current!.value.substring(1)
						.match(/.{2}/g)!
						.map(x => parseInt(x, 16));

					fetch("/pixel", {
						method: "POST",
						headers: {
							"Accept": "application/json",
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ x, y, color: { r, g, b } })
					});
				}}
			/>
			<div className="pointer-events-none fixed inset-0 z-10 grid h-full grid-cols-[35px,1fr,200px,1fr,35px] grid-rows-[35px,1fr,35px] p-2 [&>*]:pointer-events-auto">
				<div className="pill col-start-3 row-start-1">
					({x}, {y}) {scale.toFixed(2)}x
				</div>
				<button className="icon-button col-start-1 row-start-1">
					<SimpleColorPicker ref={colorRef} />
				</button>
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
