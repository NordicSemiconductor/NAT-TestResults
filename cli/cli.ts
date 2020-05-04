import * as program from 'commander'
import * as chalk from 'chalk'
import { athenaCommand } from './athenaCommand'
import { stackOutput } from '@bifravst/cloudformation-helpers'
import { CloudFormation } from 'aws-sdk'
import { defaultStackName } from '../aws/stackName'

export type CommandDefinition = {
	command: string
	action: (...args: any) => Promise<void>
	options?: { flags: string; description?: string; defaultValue?: any }[]
	help: string
}

const cf = new CloudFormation()
const so = stackOutput(cf)

const config = async ({
	stackName,
	serverStackName,
}: {
	stackName: string
	serverStackName: string
}) => {
	const { bucketName: queryResultsBucketName } = await so<{
		bucketName: string
	}>(stackName)
	const { bucketName: logsBucketName } = await so<{ bucketName: string }>(
		serverStackName,
	)
	return {
		logsBucketName,
		queryResultsBucketName,
	}
}

export const cli = async (args: {
	stackName?: string
	serverStackName: string
}) => {
	program.description('NAT Test Reporter Command Line Interface')
	const stackName = args.stackName || defaultStackName
	const serverStackName = args.serverStackName
	console.log('Stack name:          ', chalk.yellow(stackName))
	console.log('Server stack name:   ', chalk.yellow(serverStackName))

	const cfg = await config({ stackName, serverStackName })

	console.log('Logs bucket:         ', cfg.logsBucketName)
	console.log('Query results bucket:', cfg.queryResultsBucketName)

	const commands: CommandDefinition[] = [
		athenaCommand({
			stackName,
			LogBucketName: cfg.logsBucketName,
			QueryResultsBucketName: cfg.queryResultsBucketName,
		}),
	]

	let ran = false
	commands.forEach(({ command, action, help, options }) => {
		const cmd = program.command(command)
		cmd
			.action(async (...args) => {
				try {
					ran = true
					await action(...args)
				} catch (error) {
					console.error(
						chalk.red.inverse(' ERROR '),
						chalk.red(`${command} failed!`),
					)
					console.error(chalk.red.inverse(' ERROR '), chalk.red(error))
					process.exit(1)
				}
			})
			.on('--help', () => {
				console.log('')
				console.log(chalk.yellow(help))
				console.log('')
			})
		options?.forEach(({ flags, description, defaultValue }) =>
			cmd.option(flags, description, defaultValue),
		)
	})

	program.parse(process.argv)

	if (!ran) {
		program.outputHelp(chalk.yellow)
		throw new Error('No command selected!')
	}
}
