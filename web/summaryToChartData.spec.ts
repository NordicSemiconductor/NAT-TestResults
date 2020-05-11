import { summaryToChartData, Protocol } from './summaryToChartData'

describe('summaryToChartData', () => {
	it('should convert a summary', () => {
		expect(
			summaryToChartData([
				{
					protocol: Protocol.UDP,
					mccmnc: '24201',
					simIIN: 893108,
					maxInterval: 49,
				},
				{
					protocol: Protocol.UDP,
					mccmnc: '24202',
					simIIN: 894504,
					maxInterval: 64,
				},
				{
					protocol: Protocol.TCP,
					mccmnc: '24201',
					simIIN: 8988280,
					maxInterval: 675,
				},
				{
					protocol: Protocol.UDP,
					mccmnc: '24201',
					simIIN: 8988280,
					maxInterval: 121,
				},
				{
					protocol: Protocol.TCP,
					mccmnc: '24201',
					simIIN: 893108,
					maxInterval: 5122,
				},
				{
					protocol: Protocol.TCP,
					mccmnc: '24202',
					simIIN: 894504,
					maxInterval: 11524,
				},
			]),
		).toEqual([
			{
				networkIdentifier: '24202/894504',
				maxTCP: 11524,
				maxUDP: -64,
			},
			{
				networkIdentifier: '24201/893108',
				maxTCP: 5122,
				maxUDP: -49,
			},
			{
				networkIdentifier: '24201/8988280',
				maxTCP: 675,
				maxUDP: -121,
			},
		])
	})
})
