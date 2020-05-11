import React, { useEffect, useRef } from 'react'
import { AthenaContext, AthenaConsumer } from './AthenaContext'
import { query, parseResult } from '@bifravst/athena-helpers'
import PQueue from 'p-queue'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import { v4 } from 'uuid'
import styled from 'styled-components'
import { SummaryItem, summaryToChartData } from './summaryToChartData'

const DiagramDiv = styled.div`
	width: 100%;
	height: 250px;
`

const queue = new PQueue({ concurrency: 1 })

const Summary = ({ athenaContext }: { athenaContext: AthenaContext }) => {
	const { athena, workGroup } = athenaContext
	const chartRef = useRef<am4charts.XYChart>()
	const uuid = useRef<string>(v4())

	useEffect(() => {
		let isUnmounted = false
		const chart = am4core.create(uuid.current, am4charts.XYChart)
		chartRef.current = chart

		// Use only absolute numbers
		chart.numberFormatter.numberFormat = '#.#s'

		// Create axes
		const neworkAxis = chart.yAxes.push(new am4charts.CategoryAxis())
		neworkAxis.dataFields.category = 'networkIdentifier'
		neworkAxis.renderer.grid.template.location = 0
		neworkAxis.renderer.inversed = true

		const timeoutAxis = chart.xAxes.push(new am4charts.ValueAxis())
		timeoutAxis.renderer.minGridDistance = 40
		timeoutAxis.renderer.ticks.template.length = 5
		timeoutAxis.renderer.ticks.template.disabled = false
		timeoutAxis.renderer.ticks.template.strokeOpacity = 0.4

		// Create series
		const tcp = chart.series.push(new am4charts.ColumnSeries())
		tcp.dataFields.valueX = 'maxTCP'
		tcp.dataFields.categoryY = 'networkIdentifier'
		tcp.clustered = false

		const tcpLabel = tcp.bullets.push(new am4charts.LabelBullet())
		tcpLabel.label.text = '{valueX}'
		tcpLabel.label.hideOversized = false
		tcpLabel.label.truncate = false
		tcpLabel.label.horizontalCenter = 'left'
		tcpLabel.label.dx = 10

		const udp = chart.series.push(new am4charts.ColumnSeries())
		udp.dataFields.valueX = 'maxUDP'
		udp.dataFields.categoryY = 'networkIdentifier'
		udp.clustered = false

		const udpLabel = udp.bullets.push(new am4charts.LabelBullet())
		udpLabel.label.text = '{valueX}'
		udpLabel.label.hideOversized = false
		udpLabel.label.truncate = false
		udpLabel.label.horizontalCenter = 'right'
		udpLabel.label.dx = -10

		const tcpRange = timeoutAxis.axisRanges.create()
		tcpRange.label.text = 'TCP'
		tcpRange.label.fill = chart.colors.list[0]
		tcpRange.label.fontWeight = '600'
		tcpRange.label.dy = 20
		tcpRange.value = 0
		tcpRange.endValue = 11524
		tcpRange.grid.strokeOpacity = 1
		tcpRange.grid.stroke = tcp.stroke

		const udpRange = timeoutAxis.axisRanges.create()
		udpRange.label.text = 'UDP'
		udpRange.label.fill = chart.colors.list[1]
		udpRange.label.fontWeight = '600'
		udpRange.label.dy = 20
		udpRange.value = -121
		udpRange.endValue = 0
		udpRange.grid.strokeOpacity = 1
		udpRange.grid.stroke = udp.stroke

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
				const data = parseResult({
					ResultSet,
					skip: 1,
				}) as SummaryItem[]
				console.debug('[Summary]', JSON.stringify(data, null, 2))
				chart.data = summaryToChartData(data)
			})
			.catch(console.error)

		return () => {
			isUnmounted = true
			chartRef.current && chartRef.current.dispose()
		}
	}, [athenaContext])
	return <DiagramDiv id={uuid.current} />
}

export const Dashboard = () => (
	<AthenaConsumer>
		{(athenaContext) => (
			<main>
				<Summary athenaContext={athenaContext} />
			</main>
		)}
	</AthenaConsumer>
)
