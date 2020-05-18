import React, { useEffect, useRef } from 'react'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import { v4 } from 'uuid'
import {
	SummaryItem,
	summaryToChartData,
	ChartItem,
} from './summaryToChartData'
import { formatDistance } from 'date-fns'
import styled from 'styled-components'

const createGrid = (
	axis: am4charts.ValueAxis,
	minutes: number,
	label: string,
) => {
	const range = axis.axisRanges.create()
	range.value = minutes
	range.label.text = label
}

const ChartContainer = styled.div`
	display: none;
	@media (min-width: 1000px) {
		display: block;
	}
`

const FallbackContainer = styled.dl`
	display: grid;
	grid-template-columns: 3fr 1fr;
	width: fit-content;
	dd,
	dt {
		padding-bottom: 0.5rem;
	}
	dt {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	dd {
		text-align: right;
	}
	@media (min-width: 1000px) {
		display: none;
	}
`

const MobileFallback = ({ chartData }: { chartData: ChartItem[] }) => (
	<FallbackContainer>
		{chartData.map((item, k) => (
			<React.Fragment key={k}>
				<dt>{item.networkIdentifier}</dt>
				<dd>{Math.round(item.maxIntervalMinutes)}</dd>
			</React.Fragment>
		))}
	</FallbackContainer>
)

const TimeoutChart = ({
	chartData,
	color,
}: {
	chartData: ChartItem[]
	color: string
}) => {
	const chartRef = useRef<am4charts.XYChart>()
	const chartId = useRef<string>(v4())

	useEffect(() => {
		const chart = am4core.create(chartId.current, am4charts.XYChart)
		chartRef.current = chart

		// Use only absolute numbers
		chart.numberFormatter.numberFormat = '#.s'

		// Create axes
		const networkAxis = chart.yAxes.push(new am4charts.CategoryAxis())
		networkAxis.dataFields.category = 'networkIdentifier'
		networkAxis.renderer.grid.template.location = 0
		networkAxis.renderer.inversed = true

		const timeoutAxis = chart.xAxes.push(new am4charts.ValueAxis())
		timeoutAxis.renderer.minGridDistance = 50
		timeoutAxis.renderer.grid.template.disabled = true
		timeoutAxis.renderer.labels.template.disabled = true
		timeoutAxis.min = 0
		timeoutAxis.max =
			chartData.reduce(
				(max, { maxIntervalMinutes }) =>
					maxIntervalMinutes > max ? maxIntervalMinutes : max,
				0,
			) * 1.1

		for (let i = 1; i <= 24; i++) {
			createGrid(timeoutAxis, 60 * i, `${i}h`)
		}

		// Create series
		const series = chart.series.push(new am4charts.ColumnSeries())
		series.dataFields.valueX = 'maxIntervalMinutes'
		series.dataFields.categoryY = 'networkIdentifier'
		series.clustered = false
		series.fill = am4core.color(color)
		series.stroke = am4core.color(color)
		series.columns.template.tooltipText = '[bold]{maxInterval} seconds[/]'

		const timeoutLabel = series.bullets.push(new am4charts.LabelBullet())
		timeoutLabel.label.text = '{valueX}'
		timeoutLabel.label.hideOversized = false
		timeoutLabel.label.truncate = false
		timeoutLabel.label.horizontalCenter = 'left'
		timeoutLabel.label.dx = 10

		chart.data = chartData

		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [chartData])
	return (
		<>
			<ChartContainer
				style={{
					width: '100%',
					height: `${chartData.length * 50 + 75}px`,
				}}
				id={chartId.current}
			/>
			<MobileFallback chartData={chartData} />
		</>
	)
}

export const SummaryChart = ({
	data,
}: {
	data: {
		items: SummaryItem[]
		lastUpdated: Date
	}
}) => {
	const chartData = summaryToChartData(data.items)

	return (
		<>
			<p>
				<small>
					Last udpated:{' '}
					<time dateTime={data.lastUpdated.toISOString()}>
						{formatDistance(data.lastUpdated, new Date())} ago
					</time>
				</small>
			</p>
			<h3>TCP</h3>
			<TimeoutChart chartData={chartData.tcp} color={'#04cecd'} />
			<h3>UDP</h3>
			<TimeoutChart chartData={chartData.udp} color={'#63c6f5'} />
		</>
	)
}
