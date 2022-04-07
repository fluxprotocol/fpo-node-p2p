import logger from './logger';
import { PROJECT_NAME, PROJECT_VERSION } from './config';
import Communicator from './communication';

async function main() {
	logger.info(`🧙 Starting ${PROJECT_NAME} v${PROJECT_VERSION}`);
	const node = new Communicator('send');
	await node.init();

	const result = await node.start();
	console.log(result);
	logger.info(`🚀 Booted`);
}

main();