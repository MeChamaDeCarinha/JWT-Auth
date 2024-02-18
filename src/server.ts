import express from "express";

const app = express();
const port = 80;

app.use(express.json());
app.use(require("./routes/index"));
app.use(require("./routes/auth"));


app.listen(port, () => {
    console.clear();
    console.log("\n", "   \x1b[32m— JWT-Auth api\n", "   — Server started.", "\n\x1b[0m");
});
