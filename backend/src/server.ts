import express from "express";

const app = express();

const port = process.env.PORT || 3011;

app.get("/api/test", (req, res) => {
  res.json(["röd", "gul", "grön"])
})

app.listen(port, () => {
  console.log(`Servern lyssnar på port ${port}`)
})