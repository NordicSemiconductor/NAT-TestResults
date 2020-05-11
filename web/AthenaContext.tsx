import * as React from 'react'
import Athena from 'aws-sdk/clients/athena'

export type AthenaContext = {
	athena: Athena
	workGroup: string
	dataBase: string
	logTable: string
}

export type AthenaConfig = {
	workGroup: string
	dataBase: string
	logTable: string
	bucketName: string
	region: string
}

export const AthenaContext = React.createContext<AthenaContext>({
	athena: new Athena({ region: 'us-east-1' }),
	workGroup: '',
	dataBase: '',
	logTable: '',
})
export const AthenaConsumer = AthenaContext.Consumer
