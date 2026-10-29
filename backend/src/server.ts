import express from "express";
import path from "node:path";

const app = express();
app.use(express.static(path.join(import.meta.dirname, "../../../../frontend/dist")))

const port = process.env.PORT || 3011;

app.get("/api/test", (req, res) => {
  res.json(["röd", "gul", "grön"])
})

app.listen(port, () => {
  console.log(`Servern lyssnar på port ${port}`)
})