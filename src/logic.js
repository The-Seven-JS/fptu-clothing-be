const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
app.use(express.json());
const attribute_data_male = require("./attribute_data_male.json");
const attribute_data_female = require("./attribute_data_female.json");
const male_advice = require("./male_advice.json");
const female_advice = require("./female_advice.json");
app.get("/attributes", (req, res) => { //trang rieng chon nam or nu
    const { gender } = req.query;
    if (gender === "male") return res.json(attribute_data_male);
    if (gender === "female") return res.json(attribute_data_female);
    return res.status(400).json({ error: "error" });
});
app.get("/advice", (req, res) => {// trang rieng chon thuoc tinh => ket qua
    const { gender, shape, skin, leg, bmi } = req.query;
    if (!gender || !shape || !skin || !leg || !bmi) {
        return res.status(400).json({ error: "missing attributes" });
    }

    const id = parseInt(shape) * 1000 + parseInt(skin) * 100 + parseInt(leg) * 10 + parseInt(bmi);
    const advice_data = gender === "male" ? male_advice : female_advice;
    const advice = advice_data.find(item => item.id === id);

    if (!advice) {
        return res.status(404).json({ error: "cant find result" });
    }

    res.json(advice);
});

app.listen(port, () => {
    console.log(`server runs at http://localhost:${port}`);
});
