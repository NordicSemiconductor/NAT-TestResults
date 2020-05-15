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
				networkIdentifier: 'Telia, SIM: Telia Sonera A/S',
				maxTCP: 11524 / 60,
				maxUDP: -64 / 60,
			},
			{
				networkIdentifier: 'Telenor, SIM: KPN Telecom B.V., Card Services',
				maxTCP: 5122 / 60,
				maxUDP: -49 / 60,
			},
			{
				networkIdentifier: 'Telenor, SIM: 1NCE GmbH',
				maxTCP: 675 / 60,
				maxUDP: -121 / 60,
			},
		])
	})
})
