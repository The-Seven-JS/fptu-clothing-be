const express = require("express");
const { Router } = require("express");
const logicRoute = Router();
const attribute_data_male = require("../attribute_data_male.json");
const attribute_data_female = require("../attribute_data_female.json");
const male_advice = require("../male_advice.json");
const female_advice = require("../female_advice.json");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function formatParagraph(paragraph) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Thêm nguyên tắc phối đồ để trên đầu, bao gồm các tiêu chí sự cân đối, màu sắc, chất liệu, phụ kiện. Sau đó viết chi tiết thêm từ nội dung trên, đầy đủ trang phục và phụ kiện, có các tiêu chí như kiểu dáng, màu sắc, chất liệu. Lưu ý tránh mặc, gộp phụ kiện vào chung, phân mỗi tiêu chí ở mỗi dòng, thêm lưu ý chung ở cuối, không thêm dấu sao ở mỗi dòng, hãy chỉ xuống dòng đơn thuần:\n\n${paragraph}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Formatted Paragraph:\n", response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

logicRoute.use(express.json());

logicRoute.get("/attributes", (req, res) => {
  //trang rieng chon nam or nu
  const { gender } = req.query;
  if (gender === "male") return res.json(attribute_data_male);
  if (gender === "female") return res.json(attribute_data_female);
  return res.status(400).json({ error: "error" });
});

logicRoute.get("/advice", async (req, res) => {
  // trang rieng chon thuoc tinh => ket qua
  const { gender, shape, skin, leg, bmi } = req.query;
  if (!gender || !shape || !skin || !leg || !bmi) {
    return res.status(400).json({ error: "missing attributes" });
  }

  const numShape = parseInt(shape, 10);
  const numSkin = parseInt(skin, 10);
  const numLeg = parseInt(leg, 10);
  const numBmi = parseInt(bmi, 10);
  if ([numShape, numSkin, numLeg, numBmi].some(isNaN)) {
    return res.status(400).json({ error: "attributes must be numbers" });
  }

  const id = numShape * 1000 + numSkin * 100 + numLeg * 10 + numBmi;
  const advice_data = gender === "male" ? male_advice : female_advice;
  const advice = advice_data.find((item) => item.id === id);

  if (!advice) {
    return res.status(404).json({ error: "cant find result" });
  }
  const formatAdvice = await formatParagraph(advice.advice);
  res.json(formatAdvice);
});

module.exports = logicRoute;
