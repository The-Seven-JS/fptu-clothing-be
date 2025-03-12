const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodeToken) => {
      if (err) {
        console.log(err.message);
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        console.log(decodeToken);
        next();
      }
    });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = requireAuth;
