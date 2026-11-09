import express from "express";
import path from "node:path";
import { ScanCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { db, TABLE_NAME } from "./db.ts";
import { ZChannel, ZMessage, ZNewMessage } from "../../packages/shared/src/schema.ts"

const app = express();
app.use(express.json());

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

app.get("/api/channels/:channelId/messages", async (req, res) => {
  try {
    const result = await db.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `CHANNEL#${req.params.channelId}`,
          ":prefix": "MSG#",
        }
      })
    )
    const parsed = z.array(ZMessage).safeParse(result.Items)
    if (!parsed.success) {
      console.error(parsed.error)
      res.sendStatus(500)
      return;
    }
    res.json(parsed.data)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

app.post("/api/channels/:channelId/messages", async (req, res) => {
  const parsed = ZNewMessage.safeParse(req.body)
  if (!parsed.success) {
    res.sendStatus(400)
    return
  }

  const item = {
    pk: `CHANNEL#${req.params.channelId}`,
    sk: `MSG#${new Date().toISOString()}`,
    sender: parsed.data.sender,
    text: parsed.data.text,
  }

  try {
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
    res.status(201).json(item)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

app.listen(port, () => {
  console.log(`Servern lyssnar på port ${port}`)
})
