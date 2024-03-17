import AerisWeather from "@aerisweather/javascript-sdk";
import { AerisCreds, getAerisId as getAerisCreds } from "../lib/credsProvider";

const headers = {
  "Content-Type": "image/png",

  // 👇 allow CORS for all origins
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
  "Access-Control-Allow-Credentials": "true", // Required for cookies, authorization headers with HTTPS
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

export const handler = async (event: any): Promise<any> => {
  const city = event.queryStringParameters.city;
  const countrycode = event.queryStringParameters.countrycode;
  if (!city || !countrycode) {
    return {
      statusCode: 400,
      body: `Error: You are missing either the query parameter city or countrycode. Both are required. E.g. ?city=tampere&countrycode=fi`,
      headers: headers,
    };
  }
  const PLACE = `${city.toLowerCase()},${countrycode.toLowerCase()}`;

  // Improvement: move the secret fetching to creating the lambda and pass secret as env variable to the lambda.
  // A bit less secure but much more efficient.
  let aerisCreds: AerisCreds;
  try {
    aerisCreds = await getAerisCreds();
  } catch (error) {
    console.error(
      "Error fetching Aeris creds from AWS SecretsManager or parsing JSON string:",
      error
    );
    throw new Error("Failed to fetch or parse Aeris creds: " + error);
  }

  const aeris = new AerisWeather(
    aerisCreds.aerisweather_id,
    aerisCreds.aerisweather_secret
  );

  try {
    console.log(`Starting fetching radar image for location ${PLACE}`);
    const req = aeris
      .map()
      .layers("flat,radar,counties,admin")
      .center(PLACE)
      .zoom(9)
      .size(500, 300)
    const res = await req.get();
    console.log(`Fetched radar image for location ${PLACE}`);

    return {
      statusCode: 200,
      body: res.image,
      headers: headers
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
      headers: headers,
    };
  }
};
