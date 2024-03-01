# Location weather service

## Setup and requirements
- Aerisweather API (Vaisala XWeather) requires registration, see https://www.xweather.com/account.
- Aerisweather credentials need to be stored in AWS SecretsManager. The app will read them from there. Region: `eu-north-1`, secret name `aerisweather`, and secret values `aerisweather_id` and `aerisweather_secret`. The cred fetching code is in `./lib/credsProvider.ts`.

## Tech stack
- All code in Typescript
- AWS CDK to define the needed AWS infrastructure
- AWS SAM to run Lambdas locally
- Aerisweather API (from Vaisala) to fetch the weather data

## Useful commands
### Run and deploy
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

### Invoke Lambda locally using AWS SAM
Requirements: AWS SAM CLI installed.

* `npx cdk synth`   Emit the synthesized CloudFormation template
* `sam local invoke getCurrentWeatherFunction --no-event -t ./cdk.out/XweatherStack.template.json`  Invoke the get current weather lambda function locally using SAM.
