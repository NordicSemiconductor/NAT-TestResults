#!/usr/bin/env node

const { cli } = require('../dist/cli/cli')

cli({
	stackName: process.env.STACK_NAME,
	serverStackName: process.env.SERVER_STACK_NAME,
}).catch((err) => {
	console.error(chalk.red(err))
	process.exit(1)
})
