const { html, getVersion } = require('./html')

process.stdout.write(
	html({
		VERSION: getVersion(),
		IS_PRODUCTION: JSON.stringify(true),
		SITE_DIR: process.env.SITE_DIR,
	}),
)
