import * as CloudFormation from '@aws-cdk/core'
import * as S3 from '@aws-cdk/aws-s3'
import * as IAM from '@aws-cdk/aws-iam'
import * as Cognito from '@aws-cdk/aws-cognito'

export class ReporterStack extends CloudFormation.Stack {
	public constructor(
		parent: CloudFormation.App,
		id: string,
		{
			serverStackName,
		}: {
			serverStackName: string
		},
	) {
		super(parent, id)

		const logsBucket = S3.Bucket.fromBucketAttributes(this, 'LogsBucket', {
			bucketName: CloudFormation.Fn.importValue(
				`${serverStackName}:bucketName`,
			),
		})

		const queryResultsBucket = new S3.Bucket(this, 'queryResults', {
			removalPolicy: CloudFormation.RemovalPolicy.DESTROY,
		})

		new CloudFormation.CfnOutput(this, 'bucketName', {
			value: queryResultsBucket.bucketName,
			exportName: `${this.stackName}:bucketName`,
		})

		const userPool = new Cognito.UserPool(this, 'userPool', {
			userPoolName: id,
			signInAliases: {
				email: true,
			},
			autoVerify: {
				email: true,
			},
		})
		const userPoolClient = new Cognito.UserPoolClient(this, 'userPoolClient', {
			userPool: userPool,
			authFlows: {
				userPassword: true,
				userSrp: true,
				adminUserPassword: true,
				refreshToken: true, // REFRESH_TOKEN_AUTH should always be allowed.
			},
		})
		const developerProviderName = 'developerAuthenticated'

		new CloudFormation.CfnOutput(this, 'developerProviderName', {
			value: developerProviderName,
			exportName: `${this.stackName}:developerProviderName`,
		})

		const identityPool = new Cognito.CfnIdentityPool(this, 'identityPool', {
			identityPoolName: id.replace(/-/, '_'),
			allowUnauthenticatedIdentities: false,
			cognitoIdentityProviders: [
				{
					clientId: userPoolClient.userPoolClientId,
					providerName: userPool.userPoolProviderName,
				},
			],
			developerProviderName,
		})

		const userRole = new IAM.Role(this, 'userRole', {
			assumedBy: new IAM.FederatedPrincipal(
				'cognito-identity.amazonaws.com',
				{
					StringEquals: {
						'cognito-identity.amazonaws.com:aud': identityPool.ref,
					},
					'ForAnyValue:StringLike': {
						'cognito-identity.amazonaws.com:amr': 'authenticated',
					},
				},
				'sts:AssumeRoleWithWebIdentity',
			),
			inlinePolicies: {
				queryLogsWithAthena: new IAM.PolicyDocument({
					statements: [
						new IAM.PolicyStatement({
							resources: ['*'],
							actions: [
								'athena:startQueryExecution',
								'athena:stopQueryExecution',
								'athena:getQueryExecution',
								'athena:getQueryResults',
								'glue:GetTable',
								'glue:GetDatabase',
							],
						}),
						// Users need to read from data bucket
						new IAM.PolicyStatement({
							resources: [logsBucket.bucketArn, `${logsBucket.bucketArn}/*`],
							actions: [
								's3:GetBucketLocation',
								's3:GetObject',
								's3:ListBucket',
								's3:ListBucketMultipartUploads',
								's3:ListMultipartUploadParts',
							],
						}),

						new IAM.PolicyStatement({
							resources: [
								queryResultsBucket.bucketArn,
								`${queryResultsBucket.bucketArn}/*`,
							],
							actions: [
								's3:GetBucketLocation',
								's3:GetObject',
								's3:ListBucket',
								's3:ListBucketMultipartUploads',
								's3:ListMultipartUploadParts',
								's3:AbortMultipartUpload',
								's3:PutObject',
							],
						}),
						new IAM.PolicyStatement({
							resources: [logsBucket.bucketArn, `${logsBucket.bucketArn}/*`],
							actions: [
								's3:GetBucketLocation',
								's3:GetObject',
								's3:ListBucket',
							],
						}),
						// Users need to be able to write to the results bucket
						new IAM.PolicyStatement({
							resources: [
								queryResultsBucket.bucketArn,
								`${queryResultsBucket.bucketArn}/*`,
							],
							actions: [
								's3:GetBucketLocation',
								's3:GetObject',
								's3:ListBucket',
								's3:ListBucketMultipartUploads',
								's3:ListMultipartUploadParts',
								's3:AbortMultipartUpload',
								's3:PutObject',
							],
						}),
					],
				}),
			},
		})

		const unauthenticatedUserRole = new IAM.Role(
			this,
			'unauthenticatedUserRole',
			{
				assumedBy: new IAM.FederatedPrincipal(
					'cognito-identity.amazonaws.com',
					{
						StringEquals: {
							'cognito-identity.amazonaws.com:aud': identityPool.ref,
						},
						'ForAnyValue:StringLike': {
							'cognito-identity.amazonaws.com:amr': 'unauthenticated',
						},
					},
					'sts:AssumeRoleWithWebIdentity',
				),
			},
		)

		new Cognito.CfnIdentityPoolRoleAttachment(this, 'identityPoolRoles', {
			identityPoolId: identityPool.ref.toString(),
			roles: {
				authenticated: userRole.roleArn,
				unauthenticated: unauthenticatedUserRole.roleArn,
			},
		})

		new CloudFormation.CfnOutput(this, 'userPoolId', {
			value: userPool.userPoolId,
			exportName: `${this.stackName}:userPoolId`,
		})

		new CloudFormation.CfnOutput(this, 'identityPoolId', {
			value: identityPool.ref,
			exportName: `${this.stackName}:identityPoolId`,
		})

		new CloudFormation.CfnOutput(this, 'userPoolClientId', {
			value: userPoolClient.userPoolClientId,
			exportName: `${this.stackName}:userPoolClientId`,
		})
	}
}
