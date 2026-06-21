import express from "express";
const app = express();
app.get("/", (req, res) => res.send("<h1>Server Express Aktif dan Bisa Diakses!</h1>"));
app.listen(3000, "0.0.0.0", () => console.log("Test server running on port 3000"));