import { CommandDefinition } from './cli'
import {
	DataBaseName,
	WorkGroupName,
	LogsTableName,
} from '../aws/athena/settings'
import { objectToEnv } from '@bifravst/cloudformation-helpers'

export const appConfigCommand = ({
	stackName,
	region,
	LogBucketName,
	cognitoIdentityPoolId,
	cognitoUserPoolId,
	cognitoUserPoolClientId,
}: {
	stackName: string
	region: string
	LogBucketName: string
	cognitoIdentityPoolId: string
	cognitoUserPoolId: string
	cognitoUserPoolClientId: string
}): CommandDefinition => ({
	command: 'app-config',
	action: async () => {
		process.stdout.write(
			objectToEnv({
				region,
				cognitoIdentityPoolId,
				cognitoUserPoolId,
				cognitoUserPoolClientId,
				athenaWorkgroup: WorkGroupName({ stackName }),
				athenaDatabase: DataBaseName({ stackName }),
				athenaTable: LogsTableName,
				athenaBucket: LogBucketName,
			}),
		)
	},
	help: 'Prints the config required for the web app.',
})
