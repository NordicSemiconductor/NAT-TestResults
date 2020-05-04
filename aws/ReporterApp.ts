import { App } from '@aws-cdk/core'
import { ReporterStack } from './ReporterStack'

export class ReporterApp extends App {
	public constructor(
		stackId: string,
		args: {
			serverStackName: string
		},
	) {
		super()
		new ReporterStack(this, stackId, args)
	}
}
