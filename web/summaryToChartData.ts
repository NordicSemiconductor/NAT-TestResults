import { filter as filterOperator } from 'mcc-mnc-list'
import { identifyIssuer } from 'e118-iin-list'
import { isSome } from 'fp-ts/lib/Option'

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
	maxInterval: number
}

const identifyNetwork = (summary: SummaryItem): string => {
	let simIssuer = 'unknown'
	const issuer = identifyIssuer(`${summary.simIIN}`)
	if (isSome(issuer)) {
		simIssuer = issuer.value.companyName
	}
	const op = filterOperator({ mccmnc: summary.mccmnc })[0]
	return `${
		op ? op.brand : `Unknown operator (${summary.mccmnc})`
	} (${simIssuer})`
}

const summarize = (summary: SummaryItem[], protocol: Protocol) =>
	summary
		.filter(({ protocol: p }) => p === protocol)
		.sort(({ maxInterval: i1 }, { maxInterval: i2 }) => i2 - i1)
		.map((summary) => ({
			networkIdentifier: identifyNetwork(summary),
			maxInterval: summary.maxInterval / 60,
		}))

/**
 * Converts the data loaded from Athena to the format used by the Chart
 */
export const summaryToChartData = (
	summary: SummaryItem[],
): {
	tcp: ChartItem[]
	udp: ChartItem[]
} => ({
	tcp: summarize(summary, Protocol.TCP),
	udp: summarize(summary, Protocol.UDP),
})
