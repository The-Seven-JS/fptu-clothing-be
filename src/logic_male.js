const express = require("express");
const fs = require("fs");
const app = express();
const port = 5000;

app.use(express.json());
const attributes = JSON.parse(fs.readFileSync("fptu-clothing-be/src/attribute_data_male.json"));
const results = JSON.parse(fs.readFileSync("fptu-clothing-be/src/male_advice.json"));
app.post("/malecalculateID", (req, res) => {
    const { hinh_dang_co_the_nam, tone_da, do_dai_chan, bmi } = req.body;
    if (!hinh_dang_co_the_nam || !tone_da || !do_dai_chan || !bmi) {
        return res.status(400).json({ error: "Select all attributes" });
    }

    const resultId = hinh_dang_co_the_nam * 1000 + tone_da * 100 + do_dai_chan * 10 + bmi;
    const result = results[resultId] || "error";
    res.json({ resultId, result });
});

app.listen(port, () => {
    console.log(`running in http://localhost:${port}`);
});
