export enum Protocol {
	TCP = 'TCP',
	UDP = 'UDP',
}

export type SummaryItem = {
	protocol: Protocol
	mccmnc: string
	simIIN: number
	maxInterval: number
}

export type ChartItem = {
	networkIdentifier: string
	maxUDP: number
	maxTCP: number
}

const identifyNetwork = (summary: SummaryItem): string =>
	`${summary.mccmnc}/${summary.simIIN}`

/**
 * Converts the data loaded from Athena to the format used by the Chart
 */
export const summaryToChartData = (summary: SummaryItem[]): ChartItem[] =>
	summary
		.reduce((data, summary) => {
			const entry = data.find(
				({ networkIdentifier }) =>
					networkIdentifier === identifyNetwork(summary),
			)
			return [
				...data.filter(
					({ networkIdentifier }) =>
						networkIdentifier !== identifyNetwork(summary),
				),
				entry
					? {
							...entry,
							...(summary.protocol === Protocol.TCP
								? { maxTCP: summary.maxInterval }
								: { maxUDP: summary.maxInterval }),
					  }
					: {
							networkIdentifier: identifyNetwork(summary),
							...(summary.protocol === Protocol.TCP
								? { maxTCP: summary.maxInterval, maxUDP: 0 }
								: { maxUDP: summary.maxInterval, maxTCP: 0 }),
					  },
			]
		}, [] as ChartItem[])
		.sort(({ maxUDP: udp1 }, { maxUDP: udp2 }) => udp2 - udp1)
		.sort(({ maxTCP: tcp1 }, { maxTCP: tcp2 }) => tcp2 - tcp1)
		.map((entry) => ({ ...entry, maxUDP: -entry.maxUDP }))
