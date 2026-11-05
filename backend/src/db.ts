import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY! ,
    secretAccessKey: process.env.SECRET_ACCESS_KEY! ,
  },
})

export const db = DynamoDBDocumentClient.from(client)
export const TABLE_NAME = "chappy"