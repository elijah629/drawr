import { useWindowSize } from "@/lib/useWindowSize";
import { RefObject, useEffect, useRef, useState } from "react";
import {
	ReactZoomPanPinchContentRef,
	ReactZoomPanPinchState,
	TransformComponent,
	TransformWrapper
} from "react-zoom-pan-pinch";

const clamp = (x: number, min: number, max: number) =>
	Math.min(Math.max(x, min), max);

type CanvasProps = {
	onChange?: (
		x: number,
		y: number,
		scale: number,
		canvasX: number,
		canvasY: number
	) => void;
	onClick?: (x: number, y: number, ref: RefObject<HTMLCanvasElement>) => void;
	onCanvas?: (ref: RefObject<HTMLCanvasElement>) => void;
};

export function Canvas(props: CanvasProps): JSX.Element {
	const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [isReady, setIsReady] = useState(false);
	const [windowWidth, windowHeight] = useWindowSize();
	const [position, setPosition] = useState([0, 0]);
	const [scale, setScale] = useState(0);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const hasMouse = matchMedia("(pointer:fine)").matches;

		const onChangeCallbacks =
			transformRef.current?.instance.onChangeCallbacks;

		if (hasMouse) {
			const onMouseMove = ({ pageX, pageY }: MouseEvent) => {
				const state =
					transformRef.current?.instance.getContext().state!;

				const { x, y } = screenToCanvas(
					pageX,
					pageY,
					canvas.width,
					canvas.height,
					state
				);

				setPosition([x, y]);
			};

			const onChange = (context: ReactZoomPanPinchContentRef) => {
				const state = context.instance.getContext().state!;
				setScale(state.scale);
			};

			canvas.addEventListener("mousemove", onMouseMove);
			onChangeCallbacks?.add(onChange);

			return () => {
				canvas.removeEventListener("mousemove", onMouseMove);
				onChangeCallbacks?.delete(onChange);
			};
		} else {
			const onChange = (context: ReactZoomPanPinchContentRef) => {
				const state = context.instance.getContext().state!;

				const rect = canvas.getBoundingClientRect();

				const cx = clamp(windowWidth / 2, rect.x, rect.x + rect.width);
				const cy = clamp(
					windowHeight / 2,
					rect.y,
					rect.y + rect.height
				);

				const { x, y } = screenToCanvas(
					cx,
					cy,
					canvas.width,
					canvas.height,
					state
				);
				setPosition([x, y]);
				setScale(state.scale);
			};

			onChangeCallbacks?.add(onChange);

			return () => {
				onChangeCallbacks?.delete(onChange);
			};
		}
	}, [windowHeight, windowWidth]);

	useEffect(() => {
		const image = new Image();
		const canvas = canvasRef.current!;
		const context = canvas.getContext("2d")!;
		const onLoad = () => {
			const { width, height } = image;
			canvas.width = width;
			canvas.height = height;

			context.imageSmoothingEnabled = false;
			context.drawImage(image, 0, 0);

			setIsReady(true);
		};

		image.addEventListener("load", onLoad);
		image.src = "./image.png";

		return () => {
			image.removeEventListener("load", onLoad);
		};
	}, []);

	useEffect(() => {
		const state = transformRef.current?.instance.getContext().state!;
		props.onChange?.(
			position[0],
			position[1],
			scale,
			state.positionX,
			state.positionY
		);
	}, [props, position, scale]);

	useEffect(() => {
		props.onCanvas?.(canvasRef);
	}, [props]);

	useEffect(() => {
		const { width, height } = canvasRef.current!;
		const minScale =
			Math.min(windowWidth / width, windowHeight / height) / 1.5;
		transformRef.current?.centerView(minScale);
	}, [isReady, windowWidth, windowHeight]);

	return (
		<TransformWrapper
			ref={transformRef}
			minScale={1}
			maxScale={50}
			limitToBounds={false}
			velocityAnimation={{
				disabled: true
			}}
			doubleClick={{
				disabled: true
			}}
			zoomAnimation={{
				disabled: true
			}}>
			<TransformComponent
				wrapperClass={`!h-full !w-full ${isReady ? "" : "hidden"}`}>
				<div
					className="-z-10 will-change-auto"
					onClick={() => {
						props.onClick?.(position[0], position[1], canvasRef);
					}}>
					<canvas
						style={{ imageRendering: "pixelated" }}
						ref={canvasRef}></canvas>
				</div>
			</TransformComponent>
		</TransformWrapper>
	);
}

function screenToCanvas(
	x: number,
	y: number,
	width: number,
	height: number,
	state: ReactZoomPanPinchState
): { x: number; y: number } {
	const canvasX = clamp(
		Math.floor((x - state.positionX) / state.scale),
		0,
		width
	);
	const canvasY = clamp(
		Math.floor((y - state.positionY) / state.scale),
		0,
		height
	);

	return { x: canvasX, y: canvasY };
}
