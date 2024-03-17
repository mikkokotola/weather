import * as cdk from "aws-cdk-lib";
import {
  LambdaIntegration,
  RestApi
} from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { join } from "path";
import { AERIS_SECRET_ID } from "./credsProvider";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class XweatherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeJsFunctionProps: NodejsFunctionProps = {
      environment: {
        AERIS_ID: "could_put_aeris_id_here",
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const getCurrentWeatherLambda = new NodejsFunction(
      this,
      "getCurrentWeatherFunction",
      {
        entry: join(__dirname, "..", "lambdas", "get-current-weather.ts"),
        ...nodeJsFunctionProps,
      }
    );

    // Grant permission to the Lambda func to access the secret
    const aerisCredsSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      AERIS_SECRET_ID,
      AERIS_SECRET_ID
    );
    aerisCredsSecret.grantRead(getCurrentWeatherLambda);

    const getCurrentWeatherLambdaIntegration = new LambdaIntegration(
      getCurrentWeatherLambda
    );

    const api = new RestApi(this, "weatherApi", {
      restApiName: "Weather Service"
    });

    const weatherApi = api.root.addResource("weather");
    weatherApi.addMethod("GET", getCurrentWeatherLambdaIntegration);

    api.root.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
      allowCredentials: true,
    })
  }
}
