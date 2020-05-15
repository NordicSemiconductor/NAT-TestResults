const webpack = require('webpack')
const { html, getVersion } = require('../scripts/html')
const path = require('path')
const gitHubUrl = require('../package.json').homepage
const VERSION = getVersion()

const environment = {
	GLOBAL_VERSION: JSON.stringify(VERSION),
	GLOBAL_GITHUB_URL: JSON.stringify(gitHubUrl),
	GLOBAL_REGION: JSON.stringify(process.env.REGION),
	GLOBAL_COGNITO_IDENTITY_POOL_ID: JSON.stringify(
		process.env.COGNITO_IDENTITY_POOL_ID,
	),
	GLOBAL_COGNITO_USER_POOL_ID: JSON.stringify(process.env.COGNITO_USER_POOL_ID),
	GLOBAL_COGNITO_USER_POOL_CLIENT_ID: JSON.stringify(
		process.env.COGNITO_USER_POOL_CLIENT_ID,
	),
	GLOBAL_ATHENA_WORKGROUP: JSON.stringify(process.env.ATHENA_WORKGROUP),
	GLOBAL_ATHENA_DATABASE: JSON.stringify(process.env.ATHENA_DATABASE),
	GLOBAL_ATHENA_TABLE: JSON.stringify(process.env.ATHENA_TABLE),
	GLOBAL_ATHENA_BUCKET: JSON.stringify(process.env.ATHENA_BUCKET),
}

const cfg = {
	entry: path.join(process.cwd(), 'web', 'index.tsx'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(process.cwd(), 'public'),
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.mjs', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							configFile: path.join(process.cwd(), 'web', 'tsconfig.json'),
						},
					},
				],
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack'],
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
}

module.exports = [
	{
		...cfg,
		mode: 'production',
		name: 'production',
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(true),
				...environment,
			}),
		],
	},
	{
		...cfg,
		name: 'development',
		mode: 'development',
		devtool: 'none',
		devServer: {
			contentBase: './web',
			before: (app, server, compiler) => {
				app.get('/', (req, res) => {
					res.set('Content-Type', 'text/html')
					res.send(
						html({
							VERSION,
							IS_PRODUCTION: JSON.stringify(false),
						}),
					)
				})
			},
			port: 8123,
		},
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(false),
				...environment,
			}),
		],
	},
]
