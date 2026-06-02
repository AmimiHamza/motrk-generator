import express from "express";
import cors from "cors";
import { generateRouter } from "./routes/generate.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Cropped images are base64 and can be large.
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/generate", generateRouter);

app.listen(PORT, () => {
  console.log(`MOTRK server listening on http://localhost:${PORT}`);
});
