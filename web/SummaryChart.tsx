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
		chart.numberFormatter.numberFormat = '#.#s'

		// Create axes
		const networkAxis = chart.yAxes.push(new am4charts.CategoryAxis())
		networkAxis.dataFields.category = 'networkIdentifier'
		networkAxis.renderer.grid.template.location = 0
		networkAxis.renderer.inversed = true

		const timeoutAxis = chart.xAxes.push(new am4charts.ValueAxis())
		timeoutAxis.renderer.minGridDistance = 50
		timeoutAxis.renderer.ticks.template.length = 5
		timeoutAxis.renderer.ticks.template.disabled = false
		timeoutAxis.renderer.ticks.template.strokeOpacity = 0.4
		timeoutAxis.min = 0
		timeoutAxis.max =
			chartData.reduce(
				(max, { maxInterval }) => (maxInterval > max ? maxInterval : max),
				0,
			) * 1.1

		// Create series
		const series = chart.series.push(new am4charts.ColumnSeries())
		series.dataFields.valueX = 'maxInterval'
		series.dataFields.categoryY = 'networkIdentifier'
		series.clustered = false
		series.fill = am4core.color(color)
		series.stroke = am4core.color(color)

		const bullet = series.bullets.push(new am4charts.LabelBullet())
		bullet.label.text = '{valueX}'
		bullet.label.hideOversized = false
		bullet.label.truncate = false
		bullet.label.horizontalCenter = 'left'
		bullet.label.dx = 10

		chart.data = chartData

		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [chartData])
	return (
		<div
			style={{
				width: '100%',
				height: `${chartData.length * 50 + 75}px`,
			}}
			id={chartId.current}
		/>
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
			<h3>TCP</h3>
			<TimeoutChart chartData={chartData.tcp} color={'#04cecd'} />
			<h3>UDP</h3>
			<TimeoutChart chartData={chartData.udp} color={'#63c6f5'} />
			<p>
				<small>
					Last udpated:{' '}
					<time dateTime={data.lastUpdated.toISOString()}>
						{formatDistance(data.lastUpdated, new Date())} ago
					</time>
				</small>
			</p>
		</>
	)
}
