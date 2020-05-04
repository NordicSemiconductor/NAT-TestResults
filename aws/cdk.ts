import { ReporterApp } from './ReporterApp'
import { stackName } from './stackName'

const serverStackName = process.env.SERVER_STACK_NAME

if (!serverStackName) {
	console.error('Server stack name is not defined! Set SERVER_STACK_NAME!')
	process.exit(1)
}

new ReporterApp(stackName, {
	serverStackName,
})
