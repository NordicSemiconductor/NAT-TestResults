import React, { useEffect, useState } from 'react'
import { AthenaContext, AthenaConsumer } from './AthenaContext'
import { query, parseResult } from '@bifravst/athena-helpers'
import PQueue from 'p-queue'
import { SummaryItem } from './summaryToChartData'
import { Loading } from './Loading'
import { SummaryChart } from './SummaryChart'
import { Dashboard as StyledDashboard } from './styles/dashboard.ts'

const queue = new PQueue({ concurrency: 1 })

const Summary = ({ athenaContext }: { athenaContext: AthenaContext }) => {
	const { athena, workGroup } = athenaContext
	const [data, setData] = useState<SummaryItem[]>([])

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
		queue
			.add(async () =>
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
			)
			.then(async (ResultSet) => {
				if (isUnmounted) {
					console.debug(
						'[Summary]',
						'Received result, but was removed already.',
					)
					return
				}
				setData(
					parseResult({
						ResultSet,
						skip: 1,
					}) as SummaryItem[],
				)
			})
			.catch(console.error)

		return () => {
			isUnmounted = true
		}
	}, [athenaContext])
	if (!data.length) return <Loading />
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
