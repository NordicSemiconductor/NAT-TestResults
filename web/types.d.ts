declare module '*.svg' {
	const content: React.StatelessComponent<React.SVGAttributes<SVGElement>>
	export default content
}
/**
 * This string is replaced through webpack.
 */
declare const GLOBAL_VERSION: string

/**
 * This string is replaced through webpack.
 */
declare const GLOBAL_IS_PRODUCTION: boolean

/**
 * The GitHub URL of this project
 */
declare const GLOBAL_GITHUB_URL: string

/**
 * AWS region
 */
declare const GLOBAL_REGION: string

/**
 * Cognito Identity Pool ID
 */
declare const GLOBAL_COGNITO_IDENTITY_POOL_ID: string

/**
 * Cognito User Pool ID
 */
declare const GLOBAL_COGNITO_USER_POOL_ID: string

/**
 * Cognito User Pool Client ID
 */
declare const GLOBAL_COGNITO_USER_POOL_CLIENT_ID: string

/**
 * Athena WorkGroup
 */
declare const GLOBAL_ATHENA_WORKGROUP: string

/**
 * Athena Database
 */
declare const GLOBAL_ATHENA_DATABASE: string

/**
 * Athena Table
 */
declare const GLOBAL_ATHENA_TABLE: string

/**
 * Athena Bucket
 */
declare const GLOBAL_ATHENA_BUCKET: string
