import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Amplify from 'aws-amplify'
import Athena from 'aws-sdk/clients/athena'
import { GlobalStyle } from './styles/global'
import { Authenticate } from './Authenticate'

import '@aws-amplify/ui/dist/style.css'

import { log } from './log'
import { App } from './App'

const l = (...args: any) => log('App', ...args)

export const boot = ({ target }: { target: HTMLElement }) => {
	l('Version:', GLOBAL_VERSION)
	l('Production:', GLOBAL_IS_PRODUCTION)
	l('Source code:', GLOBAL_GITHUB_URL)
	l('Region:', GLOBAL_REGION)
	l('Cognito Identity Pool ID:', GLOBAL_COGNITO_IDENTITY_POOL_ID)
	l('Cognito User Pool ID:', GLOBAL_COGNITO_USER_POOL_ID)
	l('Cognito User Pool Client ID:', GLOBAL_COGNITO_USER_POOL_CLIENT_ID)
	l('Athena WorkGroup:', GLOBAL_ATHENA_WORKGROUP)
	l('Athena Database:', GLOBAL_ATHENA_DATABASE)
	l('Athena Table:', GLOBAL_ATHENA_TABLE)
	l('Athena Bucket:', GLOBAL_ATHENA_BUCKET)

	Amplify.configure({
		Auth: {
			identityPoolId: GLOBAL_COGNITO_IDENTITY_POOL_ID,
			region: GLOBAL_REGION,
			userPoolId: GLOBAL_COGNITO_USER_POOL_ID,
			userPoolWebClientId: GLOBAL_COGNITO_USER_POOL_CLIENT_ID,
			mandatorySignIn: true,
		},
	})

	ReactDOM.render(
		<>
			<GlobalStyle />
			<Authenticate>
				<React.StrictMode>
					<App />
				</React.StrictMode>
			</Authenticate>
		</>,
		target,
	)
}

export type AthenaContext = {
	athena: Athena
	workGroup: string
	dataBase: string
	rawDataTable: string
}

const AthenaContext = React.createContext<AthenaContext>({
	athena: new Athena({ region: 'us-east-1' }),
	workGroup: '',
	dataBase: '',
	rawDataTable: '',
})
export const AthenaConsumer = AthenaContext.Consumer
