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
		).toEqual({
			tcp: [
				{
					networkIdentifier: 'Telia (Telia Sonera A/S)',
					maxInterval: 11524 / 60,
				},
				{
					networkIdentifier: 'Telenor (KPN Telecom B.V., Card Services)',
					maxInterval: 5122 / 60,
				},
				{
					networkIdentifier: 'Telenor (1NCE GmbH)',
					maxInterval: 675 / 60,
				},
			],
			udp: [
				{
					networkIdentifier: 'Telenor (1NCE GmbH)',
					maxInterval: 121 / 60,
				},
				{
					networkIdentifier: 'Telia (Telia Sonera A/S)',
					maxInterval: 64 / 60,
				},
				{
					networkIdentifier: 'Telenor (KPN Telecom B.V., Card Services)',
					maxInterval: 49 / 60,
				},
			],
		})
	})
})
