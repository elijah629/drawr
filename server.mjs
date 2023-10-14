import express from "express";
import { Server } from "http";

import next from "next";
import path from "path";
import { fileURLToPath, parse } from "url";

import { PNG } from "pngjs";
import fs from "fs";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = express();
const server = Server(app);
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

nextApp.prepare().then(() => {
	app.use(express.json());

	let id = 0;

	// ID to write function for SSE
	const clients = {};

	app.get("*", async (req, res) => {
		try {
			// Subscribe to pixel placement events
			if (req.url === "/pixel/events") {
				res.set({
					"Cache-Control": "no-cache",
					"Content-Type": "text/event-stream",
					"Connection": "keep-alive"
				});
				res.flushHeaders();

				// Retry: 10s if conn is lost
				res.write("retry: 10000\n\n");

				const client_id = ++id;

				clients[client_id] = res.write.bind(res);

				req.on("close", () => {
					delete clients[client_id];
				});
			} else if (req.url === "/image.png") {
				res.sendFile(path.join(__dirname, "image.png"));
			} else {
				await handle(req, res, parse(req.url, true));
			}
		} catch (error) {
			console.error(error);
			res.statusCode = 500;
			res.end("Internal Server Error");
		}
	});

	function i(x) {
		return typeof x === "number";
	}
	// Set a pixel
	app.post("/pixel", async (req, res) => {
		const x = req.body;
		if (
			i(x.x) /* TODO: Bounds check */ &&
			i(x.y) &&
			i(x.color.r) &&
			i(x.color.g) &&
			i(x.color.b)
		) {
			for (id in clients) {
				clients[id](
					`data: ${JSON.stringify({
						x: x.x,
						y: x.y,
						color: { r: x.color.r, g: x.color.g, b: x.color.b }
					})}\n\n`
				);
			}

			fs.createReadStream("image.png")
				.pipe(
					new PNG({
						filterType: 4
					})
				)
				.on("parsed", function () {
					const idx = (x.y * this.width + x.x) * 4;
					this.data[idx] = x.color.r;
					this.data[idx + 1] = x.color.g;
					this.data[idx + 2] = x.color.b;

					this.pack().pipe(fs.createWriteStream("image.png"));
				});
		}
		res.end();
	});

	server.listen(3000, () => {
		console.log(
			`ready - started custom server on http://${hostname}:${port}`
		);
	});
});
