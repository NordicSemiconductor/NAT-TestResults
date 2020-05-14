import React, { useEffect, useState } from 'react'
import { AthenaContext, AthenaConsumer } from './AthenaContext'
import { query, parseResult } from '@bifravst/athena-helpers'
import PQueue from 'p-queue'
import { SummaryItem } from './summaryToChartData'
import { Loading } from './Loading'
import { SummaryChart } from './SummaryChart'
import { Dashboard as StyledDashboard } from './styles/dashboard'

const queue = new PQueue({ concurrency: 1 })

const Summary = ({ athenaContext }: { athenaContext: AthenaContext }) => {
	const { athena, workGroup } = athenaContext
	const [data, setData] = useState<{
		items: SummaryItem[]
		lastUpdated: Date
	}>()

	useEffect(() => {
		let isUnmounted = false

		const q = query({
			WorkGroup: workGroup,
			athena,
			debugLog: (...args: any) => {
				console.debug('[athena]', ...args)
			},
			errorLog: (...args: any) => {
				console.error('[athena]', ...args)
			},
		})
		Promise.all([
			queue.add(async () =>
				q({
					QueryString: `SELECT 
				protocol,
				message.op as mccmnc,
				simIssuer.iin as simIIN,
				MAX(message.interval) AS maxInterval
				FROM ${athenaContext.dataBase}.${athenaContext.logTable}
				WHERE timeout = FALSE and simIssuer IS NOT NULL
				GROUP BY  1,2,3`,
				}),
			),
			queue.add(async () =>
				q({
					QueryString: `SELECT max(date_parse(timestamp, '%Y-%m-%dT%H:%i:%s.%fZ')) as latest
				FROM ${athenaContext.dataBase}.${athenaContext.logTable}`,
				}),
			),
		])
			.then(async ([result, latestResultSet]) => {
				if (isUnmounted) {
					console.debug(
						'[Summary]',
						'Received result, but was removed already.',
					)
					return
				}
				setData({
					items: parseResult({
						ResultSet: result,
						skip: 1,
					}) as SummaryItem[],
					lastUpdated: (parseResult({
						ResultSet: latestResultSet,
						skip: 1,
						formatFields: {
							latest: (v) => new Date(v),
						},
					})[0].latest as unknown) as Date,
				})
			})
			.catch(console.error)

		return () => {
			isUnmounted = true
		}
	}, [athenaContext])
	if (!data) return <Loading />
	return <SummaryChart data={data} />
}

export const Dashboard = () => (
	<AthenaConsumer>
		{(athenaContext) => (
			<StyledDashboard>
				<section>
					<h2>Max keep-alive in minutes</h2>
					<Summary athenaContext={athenaContext} />
				</section>
			</StyledDashboard>
		)}
	</AthenaConsumer>
)
