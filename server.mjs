import express from "express";
import { createServer } from "node:http";

import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

import fs from "node:fs";
import { PngImg as PNG } from "png-img";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

const image = new PNG(fs.readFileSync("nostatic/canvas.png"));

const app = express();
const server = createServer(app);

const io = new Server(server);

app.use(express.static("nostatic"));

app.use(async (req, res) => {
	try {
		await handle(req, res, parse(req.url, true));
	} catch (error) {
		console.error(error);
		res.statusCode = 500;
		res.end("Internal Server Error");
	}
});

io.on("connection", socket => {
	const date = new Date();
	console.log(`conn  - ${socket.handshake.address} [${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}]`)
	socket.on("set", args => {
		console.log(`set   - ${socket.handshake.address} (${args.x}, ${args.y}) ${args.color}`);
		if (!args || !args.x || !args.y || !args.color || typeof args.x !== "number" || typeof args.y !== "number" || typeof args.color !== "string") {
			return;
		}

		io.sockets.emit("set", args);
		image.set(args.x, args.y, args.color);
		image.save("nostatic/canvas.png");
	});
	socket.on("disconnect", () => {
		console.log(`dconn - ${socket.handshake.address}`)
	});
});

server.once("error", error => {
	console.error(error);
	process.exit(1);
});

nextApp.prepare().then(() => {
	server.listen(3000, () => {
		console.log(
			`ready - started custom server on http://${hostname}:${port}`
		);
	});
});
