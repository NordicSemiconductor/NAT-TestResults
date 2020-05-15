#!/usr/bin/env node

const { cli } = require('../dist/cli/cli')
const chalk = require('chalk')

cli({
	stackName: process.env.STACK_NAME,
	serverStackName: process.env.SERVER_STACK_NAME,
	region: process.env.AWS_REGION,
}).catch((err) => {
	console.error(chalk.red(err))
	process.exit(1)
})
