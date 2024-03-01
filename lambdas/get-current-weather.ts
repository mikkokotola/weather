import AerisWeather from "@aerisweather/javascript-sdk";
import { AerisCreds, getAerisId as getAerisCreds } from "../lib/credsProvider";

export const handler = async (): Promise<any> => {
  const PLACE = "tampere,fi"

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

    const data = res.data.ob;
    const response = res.data.ob;
    console.log(
      `The current weather in ${PLACE} is ${data.weatherPrimary.toLowerCase()} and ${
        data.tempC
      } degrees (C).`
    );
    console.log(response);

    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
