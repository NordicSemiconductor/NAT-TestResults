import {
	AthenaTableArrayFieldType,
	AthenaTableField,
	AthenaTableScalarFieldType,
	AthenaTableStructFieldType,
} from '@bifravst/athena-helpers'

/**
 * This defines the table structure for querying device data
 */
export const natLogMessageFields: {
	[key: string]: AthenaTableField
} = {
	Received: {
		type: AthenaTableScalarFieldType.string,
	},
	Protocol: {
		type: AthenaTableScalarFieldType.string,
	},
	IP: {
		type: AthenaTableScalarFieldType.string,
	},
	Timeout: {
		type: AthenaTableScalarFieldType.boolean,
	},
	Data: {
		type: AthenaTableStructFieldType.struct,
		fields: {
			op: {
				type: AthenaTableScalarFieldType.string,
			},
			ip: {
				type: AthenaTableArrayFieldType.array,
				items: AthenaTableScalarFieldType.string,
			},
			cell_id: {
				type: AthenaTableScalarFieldType.int,
			},
			ue_mode: {
				type: AthenaTableScalarFieldType.int,
			},
			lte_mode: {
				type: AthenaTableScalarFieldType.int,
			},
			nbiot_mode: {
				type: AthenaTableScalarFieldType.int,
			},
			gps_mode: {
				type: AthenaTableScalarFieldType.int,
			},
			iccid: {
				type: AthenaTableScalarFieldType.string,
			},
			imei: {
				type: AthenaTableScalarFieldType.string,
			},
			interval: {
				type: AthenaTableScalarFieldType.int,
			},
		},
	},
} as const
