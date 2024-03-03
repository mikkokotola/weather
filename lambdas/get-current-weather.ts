import AerisWeather from "@aerisweather/javascript-sdk";
import { AerisCreds, getAerisId as getAerisCreds } from "../lib/credsProvider";

export const handler = async (event: any): Promise<any> => {
  const city = event.queryStringParameters.city;
  const countrycode = event.queryStringParameters.countrycode;
  if (!city || !countrycode) {
    return { statusCode: 400, body: `Error: You are missing either the query parameter city or countrycode. Both are required. E.g. ?city=tampere&countrycode=fi` };
  }
  const PLACE = `${city.toLowerCase()},${countrycode.toLowerCase()}`;

  // Improvement: move the secret fetching to creating the lambda and pass secret as env variable to the lambda.
  // A bit less secure but much more efficient.
  let aerisCreds : AerisCreds;
  try {
    aerisCreds = await getAerisCreds();
  } catch (error) {
    console.error("Error fetching Aeris creds from AWS SecretsManager or parsing JSON string:", error);
    throw new Error("Failed to fetch or parse Aeris creds: " + error);
  }

  const aeris = new AerisWeather(
    aerisCreds.aerisweather_id,
    aerisCreds.aerisweather_secret
  );

  try {
    const res = await aeris
      .api()
      .endpoint("observations")
      .place(PLACE)
      .get();

    const response = res.data.ob;
    console.log(
      `The current weather in ${PLACE} is ${response.weatherPrimary.toLowerCase()} and ${
        response.tempC
      } degrees (C).`
    );

    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
