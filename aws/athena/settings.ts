export const DataBaseName = ({ stackName }: { stackName: string }) =>
	`${stackName.replace(/-/g, '_')}_nat_server_logs`

export const LogsTableName = 'logs'

export const WorkGroupName = ({ stackName }: { stackName: string }) => stackName
