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

const createHour = (axis: am4charts.ValueAxis, hour: number) => {
	const range = axis.axisRanges.create()
	range.value = hour * 60 * 60
	range.label.text = `${hour}h`
}

const createMinute = (axis: am4charts.ValueAxis, minute: number) => {
	const range = axis.axisRanges.create()
	range.value = minute * 60
	range.label.text = `${minute}m`
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
				<dd>{item.maxInterval}</dd>
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

		timeoutAxis.min = 0
		timeoutAxis.max =
			chartData.reduce(
				(max, { maxInterval }) => (maxInterval > max ? maxInterval : max),
				0,
			) * 1.1

		timeoutAxis.renderer.grid.template.disabled = true
		timeoutAxis.renderer.labels.template.disabled = true

		if (timeoutAxis.max > 3600) {
			for (let i = 1; i <= 24; i++) {
				createHour(timeoutAxis, i)
			}
		} else if (timeoutAxis.max > 300) {
			for (let i = 1; i <= 60; i += 5) {
				createMinute(timeoutAxis, i)
			}
		} else {
			for (let i = 1; i <= 5; i++) {
				createMinute(timeoutAxis, i)
			}
		}

		// Create series
		const series = chart.series.push(new am4charts.ColumnSeries())
		series.dataFields.valueX = 'maxInterval'
		series.dataFields.categoryY = 'networkIdentifier'
		series.clustered = false
		series.fill = am4core.color(color)
		series.stroke = am4core.color(color)

		const timeoutLabel = series.bullets.push(new am4charts.LabelBullet())
		timeoutLabel.label.text = '{valueX}'
		timeoutLabel.label.hideOversized = false
		timeoutLabel.label.truncate = false
		timeoutLabel.label.horizontalCenter = 'left'
		timeoutLabel.label.dx = 10

		chart.data = chartData

		return () => {
			chartRef.current?.dispose()
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
