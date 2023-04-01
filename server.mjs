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

const image = new PNG(fs.readFileSync("nostatic/image.png"));

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
	socket.on("set", args => {
		if (!args || !args.x || !args.y || !args.color) {
			return;
		}

		io.sockets.emit("set", args);
		image.set(args.x, args.y, args.color);
		image.save("nostatic/image.png");
	});
});

server.once("error", error => {
	console.error(error);
	process.exit(1);
});

nextApp.prepare().then(() => {
	app.listen(3000, () => {
		console.log(
			`ready - started custom server on http://${hostname}:${port}`
		);
	});
});
