import { CommandDefinition } from './cli'
import {
	athenaQuery,
	createAthenaTableSQL,
	parseAthenaResult,
} from '@bifravst/athena-helpers'
import { Athena } from 'aws-sdk'
import {
	DataBaseName,
	WorkGroupName,
	LogsTableName,
} from '../aws/athena/settings'
import * as chalk from 'chalk'
import { natLogMessageFields } from '../aws/athena/natLogMessages'

export const athenaCommand = ({
	stackName,
	QueryResultsBucketName,
	LogBucketName,
}: {
	stackName: string
	QueryResultsBucketName: string
	LogBucketName: string
}): CommandDefinition => ({
	command: 'athena',
	options: [
		{
			flags: '-s, --setup',
			description: 'Set up the necessary resources',
		},
		{
			flags: '-r, --recreate',
			description: 'Recreates the table',
		},
		{
			flags: '-d, --debug',
			description: 'Debug Athena queries',
		},
	],
	action: async ({
		setup,
		debug,
		recreate,
	}: {
		setup: boolean
		debug: boolean
		recreate: boolean
	}) => {
		const athena = new Athena()

		const { WorkGroups } = await athena.listWorkGroups().promise()

		const WorkGroup = WorkGroupName({ stackName })
		const dbName = DataBaseName({ stackName })

		if (
			!WorkGroups ||
			!WorkGroups.find(
				({ Name, State }) => State === 'ENABLED' && Name === WorkGroup,
			)
		) {
			if (setup) {
				console.log(chalk.magenta(`Creating workgroup...`))
				const createWorkGroupArgs = {
					Name: WorkGroup,
					Description: 'Workgroup for Bifravst',
					Configuration: {
						ResultConfiguration: {
							OutputLocation: `s3://${QueryResultsBucketName}/`,
						},
					},
				}
				if (debug) {
					console.debug(chalk.gray('[Athena]'), createWorkGroupArgs)
				}
				await athena.createWorkGroup(createWorkGroupArgs).promise()
			} else {
				console.log(
					chalk.red.inverse(' ERROR '),
					chalk.red(
						`Athena workgroup ${chalk.blue(WorkGroup)} does not exist!`,
					),
				)
				console.log(
					chalk.red.inverse(' ERROR '),
					chalk.red(`Pass --setup to create it.`),
				)
				return
			}
		}
		console.log(
			chalk.green.inverse(' OK '),
			chalk.gray(`Athena workgroup ${chalk.blue(WorkGroup)} exists.`),
		)

		const query = athenaQuery({
			athena,
			WorkGroup,
			debugLog: (...args: any) => {
				if (debug) {
					console.debug(
						chalk.gray('[Athena]'),
						...args.map((a: any) => chalk.blue(JSON.stringify(a))),
					)
				}
			},
			errorLog: (...args: any) => {
				console.error(
					chalk.red.inverse('[Athena]'),
					...args.map((a: any) => chalk.red(JSON.stringify(a))),
				)
			},
		})
		const dbs = parseAthenaResult({
			ResultSet: await query({
				QueryString: `SHOW DATABASES`,
			}),
		})
		if (!dbs.find(({ database_name: db }) => db === dbName)) {
			if (setup) {
				console.log(chalk.magenta(`Creating database...`))
				await query({
					QueryString: `CREATE DATABASE ${dbName}`,
				})
			} else {
				console.log(
					chalk.red.inverse(' ERROR '),
					chalk.red(`Athena database ${chalk.blue(dbName)} does not exist!`),
				)
				console.log(
					chalk.red.inverse(' ERROR '),
					chalk.red(`Pass --setup to create it.`),
				)
				return
			}
		}
		console.log(
			chalk.green.inverse(' OK '),
			chalk.gray(`Athena database ${chalk.blue(dbName)} exists.`),
		)

		if (recreate) {
			console.log(chalk.magenta(`Dropping table...`))
			await query({ QueryString: `DROP TABLE ${dbName}.${LogsTableName}` })
		}

		const checkTable = async ({
			tableName,
			setup,
			s3Location,
		}: {
			s3Location: string
			tableName: string
			setup: boolean
		}) => {
			try {
				await query({
					QueryString: `DESCRIBE ${dbName}.${tableName}`,
				})
			} catch (error) {
				if (setup) {
					console.log(chalk.magenta(`Creating table...`))
					const createSQL = createAthenaTableSQL({
						database: dbName,
						table: tableName,
						s3Location,
						fields: natLogMessageFields,
					})
					console.log(chalk.magenta(createSQL))
					await query({
						QueryString: createSQL,
					})
				} else {
					console.log(
						chalk.red.inverse(' ERROR '),
						chalk.red(
							`Athena table ${chalk.blue(
								`${dbName}.${tableName}`,
							)} does not exist!`,
						),
					)
					console.log(
						chalk.red.inverse(' ERROR '),
						chalk.red(`Pass --setup to create it.`),
					)
					return
				}
			}
		}

		await checkTable({
			tableName: LogsTableName,
			setup,
			s3Location: `s3://${LogBucketName}/`,
		})

		console.log(
			chalk.green.inverse(' OK '),
			chalk.gray(
				`Athena table ${chalk.blue(`${dbName}.${LogsTableName}`)} exists.`,
			),
		)
	},
	help: 'Manages the AWS Athena resources',
})
