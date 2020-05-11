export const log = (label: string, ...args: any) =>
	console.log(
		`%c${label}`,
		'background-color: #00a9ce; color: #ffffff; padding: 0.25rem;',
		...args,
	)
