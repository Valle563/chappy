import express from "express";
import path from "node:path";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { db, TABLE_NAME } from "./db.ts";
import { ZChannel } from "../../packages/shared/src/schema.ts"

const app = express();
app.use(express.static(path.join(import.meta.dirname, "../../../../frontend/dist")))

const port = process.env.PORT || 3011;

app.get("/api/test", (req, res) => {
  res.json(["röd", "gul", "grön"])
})

app.get("/api/channels", async (req, res) => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "sk = :sk",
        ExpressionAttributeValues: { ":sk": "meta" },
      }),
    );

    const parsed = z.array(ZChannel).safeParse(result.Items);
    if (!parsed.success) {
      console.error(parsed.error)
      res.sendStatus(500);
      return;
    }
    res.json(parsed.data);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Servern lyssnar på port ${port}`)
})