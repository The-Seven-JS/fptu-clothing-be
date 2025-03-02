const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cors = require("cors");
const demoRouter = require("./routes/demo-routes");
const attribute_data_male = require("./attribute_data_male.json");
const attribute_data_female = require("./attribute_data_female.json");
const male_advice = require("./male_advice.json");
const female_advice = require("./female_advice.json");

const app = express();
app.use(express.json());
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/demo", demoRouter);

app.use(function (req, res, next) {
  return next(createError(404, "Path not found"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    code: err.status || 500,
  });
});

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
