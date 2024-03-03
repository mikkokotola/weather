import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const AERIS_SECRET_ID = "aerisweather";

const client = new SecretsManagerClient({
  region: "eu-north-1",
});

export type AerisCreds = {
  aerisweather_id: string;
  aerisweather_secret: string;
};

export async function getAerisId(): Promise<AerisCreds> {
  const input = {
    SecretId: AERIS_SECRET_ID,
  };
  const command = new GetSecretValueCommand(input);

  try {
    const response = await client.send(command);
    const creds: AerisCreds = JSON.parse(response.SecretString as string);
    return creds;
  } catch (error) {
    console.error("Error fetching Aeris creds from AWS SecretsManager or parsing JSON string:", error);
    throw new Error("Failed to fetch or parse Aeris creds: " + error);
  }
}
