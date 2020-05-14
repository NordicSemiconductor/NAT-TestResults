import {
	ArrayFieldType,
	Field,
	ScalarFieldType,
	StructFieldType,
} from '@bifravst/athena-helpers'

/**
 * This defines the table structure for querying device data
 */
export const natLogMessageFields: {
	[key: string]: Field
} = {
	Timestamp: {
		type: ScalarFieldType.string,
	},
	Protocol: {
		type: ScalarFieldType.string,
	},
	IP: {
		type: ScalarFieldType.string,
	},
	Timeout: {
		type: ScalarFieldType.boolean,
	},
	Message: {
		type: StructFieldType.struct,
		fields: {
			op: {
				type: ScalarFieldType.string,
			},
			ip: {
				type: ArrayFieldType.array,
				items: ScalarFieldType.string,
			},
			cell_id: {
				type: ScalarFieldType.int,
			},
			ue_mode: {
				type: ScalarFieldType.int,
			},
			lte_mode: {
				type: ScalarFieldType.int,
			},
			nbiot_mode: {
				type: ScalarFieldType.int,
			},
			gps_mode: {
				type: ScalarFieldType.int,
			},
			iccid: {
				type: ScalarFieldType.string,
			},
			imei: {
				type: ScalarFieldType.string,
			},
			interval: {
				type: ScalarFieldType.int,
			},
		},
	},
	simIssuer: {
		type: StructFieldType.struct,
		fields: {
			iin: {
				type: ScalarFieldType.int,
			},
			issuerIdentifierNumber: {
				type: ScalarFieldType.string,
			},
			countryCode: {
				type: ScalarFieldType.int,
			},
			countryName: {
				type: ScalarFieldType.string,
			},
			companyName: {
				type: ScalarFieldType.string,
			},
			companyURLs: {
				type: ArrayFieldType.array,
				items: ScalarFieldType.string,
			},
		},
	},
} as const
