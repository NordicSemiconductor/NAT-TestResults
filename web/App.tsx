import * as React from 'react'
import { GlobalStyle } from './styles/global'
import { Authenticate, CredentialsConsumer } from './Authenticate'
import { Dashboard } from './Dashboard'
import { AthenaContext, AthenaConfig } from './AthenaContext'
import Athena from 'aws-sdk/clients/athena'

export const App = ({ athenaConfig }: { athenaConfig: AthenaConfig }) => {
	return (
		<>
			<GlobalStyle />
			<Authenticate>
				<CredentialsConsumer>
					{(credentials) => (
						<AthenaContext.Provider
							value={{
								athena: new Athena({
									region: athenaConfig.region,
									credentials,
								}),
								...athenaConfig,
							}}
						>
							<React.StrictMode>
								<Dashboard />
							</React.StrictMode>
						</AthenaContext.Provider>
					)}
				</CredentialsConsumer>
			</Authenticate>
		</>
	)
}
