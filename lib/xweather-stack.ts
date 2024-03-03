import * as cdk from "aws-cdk-lib";
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
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
      restApiName: "Weather Service",
    });

    const weatherApi = api.root.addResource("weather");
    weatherApi.addMethod("GET", getCurrentWeatherLambdaIntegration);

    addCorsOptions(weatherApi);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      // In case you want to use binary media types, uncomment the following line
      // contentHandling: ContentHandling.CONVERT_TO_TEXT,
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET'",
          },
        },
      ],
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
