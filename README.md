# NAT-TestReporter

![Build and Release](https://github.com/NordicSemiconductor/NAT-TestReporter/workflows/Build%20and%20Release/badge.svg?branch=saga)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Provides an analytics dashboard for the NAT test data received from the
[NAT-TestServer](https://github.com/NordicSemiconductor/NAT-TestServer/).

## Deploy to AWS

Make these environment variable available:

> ℹ️ Linux users can use [direnv](https://direnv.net/) to simplify the process.

    export AWS_REGION=<...>
    export AWS_ACCESS_KEY_ID=<Access Key ID of the service account>
    export AWS_SECRET_ACCESS_KEY=<Secret Access Key of the service account>
    export SERVER_STACK_NAME=<Stack name of the TestServer stack>

Install dependencies

    npm ci

Set the ID of the stack

    export STACK_NAME="${STACK_NAME:-nat-test-reporter}"

Deploy the server stack to an AWS account

    npx cdk deploy $STACK_NAME

## Run the UI

    npm start
