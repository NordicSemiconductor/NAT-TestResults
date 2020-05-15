import React, { useEffect, useRef } from 'react'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import { v4 } from 'uuid'
import styled from 'styled-components'
import { SummaryItem, summaryToChartData } from './summaryToChartData'
import { formatDistance } from 'date-fns'

const DiagramDiv = styled.div`
	width: 100%;
	height: 250px;
`

export const SummaryChart = ({
	data,
}: {
	data: {
		items: SummaryItem[]
		lastUpdated: Date
	}
}) => {
	const chartRef = useRef<am4charts.XYChart>()
	const uuid = useRef<string>(v4())

	const chartData = summaryToChartData(data.items)

	useEffect(() => {
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
		tcpRange.endValue = chartData.reduce(
			(highest, { maxTCP }) => (maxTCP > highest ? maxTCP : highest),
			0,
		)
		tcpRange.grid.strokeOpacity = 1
		tcpRange.grid.stroke = tcp.stroke

		const udpRange = timeoutAxis.axisRanges.create()
		udpRange.label.text = 'UDP'
		udpRange.label.fill = chart.colors.list[1]
		udpRange.label.fontWeight = '600'
		udpRange.label.dy = 20
		udpRange.value = chartData.reduce(
			(lowest, { maxUDP }) => (maxUDP < lowest ? maxUDP : lowest),
			0,
		)
		udpRange.endValue = 0
		udpRange.grid.strokeOpacity = 1
		udpRange.grid.stroke = udp.stroke

		chart.data = chartData

		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [data])
	return (
		<>
			<DiagramDiv id={uuid.current} />
			<p>
				<small>
					Last updated:{' '}
					<time dateTime={data.lastUpdated.toISOString()}>
						{formatDistance(data.lastUpdated, new Date())} ago
					</time>
				</small>
			</p>
		</>
	)
}
