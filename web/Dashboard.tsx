import React, { useEffect, useState } from 'react'
import { AthenaContext, AthenaConsumer } from './AthenaContext'
import { query, parseResult } from '@bifravst/athena-helpers'
import PQueue from 'p-queue'
import { SummaryItem } from './summaryToChartData'
import { Loading } from './Loading'
import { SummaryChart } from './SummaryChart'
import { Dashboard as StyledDashboard } from './styles/dashboard'
import { cache } from './cache'
import { endOfHour, formatDistanceToNow } from 'date-fns'
import styled from 'styled-components'

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
		// Cache until end of hour plus 2 minutes (new results will come in every hour)
		const cacheInMinutes =
			Math.ceil(
				endOfHour(new Date()).getTime() / 1000 / 60 - Date.now() / 1000 / 60,
			) + 2
		Promise.all([
			queue.add(async () =>
				cache(
					q,
					cacheInMinutes,
				)({
					QueryString: `SELECT 
				protocol,
				message.op as mccmnc,
				simIssuer.iin as simIIN,
				MAX(message.interval) AS maxInterval
				FROM ${athenaContext.dataBase}.${athenaContext.logTable}
				WHERE timeout = FALSE and simIssuer IS NOT NULL
				GROUP BY  1,2,3`,
				}).then(
					(result) =>
						parseResult({
							ResultSet: result,
							skip: 1,
						}) as SummaryItem[],
				),
			),
			queue.add(async () =>
				cache(
					q,
					cacheInMinutes,
				)({
					QueryString: `SELECT max(date_parse(timestamp, '%Y-%m-%dT%H:%i:%s.%fZ')) as latest
				FROM ${athenaContext.dataBase}.${athenaContext.logTable}`,
				}).then(
					(result) =>
						(parseResult({
							ResultSet: result,
							skip: 1,
							formatFields: {
								latest: (v) => new Date(v),
							},
						})[0].latest as unknown) as Date,
				),
			),
		])
			.then(async ([items, lastUpdated]) => {
				if (isUnmounted) {
					console.debug(
						'[Summary]',
						'Received result, but was removed already.',
					)
					return
				}
				setData({
					items,
					lastUpdated,
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

const DeviceList = styled.dl`
	display: grid;
	grid-template-columns: 1fr 1fr;
	width: fit-content;
`

const LastSeenDevices = ({
	athenaContext,
}: {
	athenaContext: AthenaContext
}) => {
	const { athena, workGroup } = athenaContext
	const [lastSeen, setLastSeen] = useState<{ imei: string; lastSeen: Date }[]>()

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
				cache(
					q,
					5,
				)({
					QueryString: `SELECT message.imei as imei, MAX(timestamp) as lastSeen FROM ${athenaContext.dataBase}.${athenaContext.logTable} WHERE message.imei IS NOT NULL GROUP BY 1`,
				}).then(
					(result) =>
						(parseResult({
							ResultSet: result,
							skip: 1,
							formatFields: {
								lastSeen: (v) => new Date(v),
							},
						}) as unknown) as { imei: string; lastSeen: Date }[],
				),
			)
			.then(async (lastSeen) => {
				if (isUnmounted) {
					console.debug(
						'[LastSeenDevices]',
						'Received result, but was removed already.',
					)
					return
				}
				setLastSeen(lastSeen)
			})
			.catch(console.error)

		return () => {
			isUnmounted = true
		}
	}, [athenaContext])
	if (!lastSeen) return <Loading />
	return (
		<DeviceList>
			{lastSeen
				.sort(
					({ lastSeen: t1 }, { lastSeen: t2 }) => t2.getTime() - t1.getTime(),
				)
				.map(({ imei, lastSeen }, k) => (
					<React.Fragment key={k}>
						<dt>
							<code>{imei}</code>
						</dt>
						<dd>
							<time dateTime={lastSeen.toISOString()}>
								{formatDistanceToNow(lastSeen)} ago
							</time>
						</dd>
					</React.Fragment>
				))}
		</DeviceList>
	)
}

export const Dashboard = () => (
	<AthenaConsumer>
		{(athenaContext) => (
			<StyledDashboard>
				<section>
					<h2>Max keep-alive in minutes</h2>
					<Summary athenaContext={athenaContext} />
				</section>
				<section>
					<h2>Last seen devices</h2>
					<LastSeenDevices athenaContext={athenaContext} />
				</section>
			</StyledDashboard>
		)}
	</AthenaConsumer>
)
