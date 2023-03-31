import next from "next";
import http from "node:http";
import { Server } from "socket.io";
import { parse } from "url";

import fs from "node:fs";
import { PngImg as PNG } from "png-img";

import chalk from "chalk";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const image = new PNG(fs.readFileSync("public/image.png"));

const server = http.createServer(async (req, res) => {
	try {
		await handle(req, res, parse(req.url, true));
	} catch (error) {
		console.error(error);
		res.statusCode = 500;
		res.end("Internal Server Error");
	}
});

const io = new Server(server);

io.on("connection", socket => {
	socket.on("set", args => {
		if (!args || !args.x || !args.y || !args.color) {
			return;
		}

		io.sockets.emit("set", args);
		image.set(args.x, args.y, args.color);
		image.save("public/image.png");
	});
});

server.once("error", error => {
	console.error(error);
	process.exit(1);
});

app.prepare().then(() =>
	server.listen(3000, () => {
		console.log(
			`${chalk.green(
				"ready"
			)} - started custom server on http://${hostname}:${port}`
		);
	})
);
