import logger from './logger';
import { PROJECT_NAME, PROJECT_VERSION } from './config';
import Communicator from './communication';
import http from "http";
import { fromString } from 'uint8arrays/from-string';
import BufferList from "bl/BufferList";

function median(values: number[]) {
	values.sort((a, b) => {
		return a - b;
	});

	let mid_point = Math.floor(values.length / 2);

	if (mid_point % 2) {
		return values[mid_point];
	} else {
		return (values[mid_point - 1 ] + values[mid_point - 2]) / 2.0;
	}
}

async function main() {
	logger.info(`🧙 Starting ${PROJECT_NAME} v${PROJECT_VERSION}`);
	let body = '';
	let json_body: { data: string } = { data: '' };
	let received: number[] = [];
	
	const node = new Communicator('send');
	await node.init();

	node.handle_incoming(async (source: AsyncIterable<Uint8Array | BufferList>) => {
		for await (const msg of source) {
			received.push(parseInt(msg.toString()));
			if (received.length = node._peers.size) {
				node.send([new Uint8Array(median(received))]);
			}
		}
	});

	const result = await node.start();

	http.createServer((req, res) => {
		logger.info(`HTTP Server Hit by ${req.socket.remoteAddress}.`);
		res.setHeader('Content-Type', 'text/json');

		if (req.url === '/send' && req.method === 'POST' && node.allowed(req.socket.remoteAddress)) {

			req.on('data', (chunk) => {
				body += chunk;
			});

			req.on('end', () => {
				logger.info(result);
				logger.info(`body: ${body}`);
				json_body = JSON.parse(body);

				node.send([fromString(json_body.data)]);

				res.statusCode = 200;
				res.end(JSON.stringify({
					code: 200,
					message: "Data Received",
				}));
			});
		} else {
			res.statusCode = 404;
			res.end(JSON.stringify({
				code: 404,
				message: "Not Found",
			}));
		}
	}).listen(8080, async () => {
		logger.info(`🚀 Booted http on port 8080`);
	});

	
}

main();