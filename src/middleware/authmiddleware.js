const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  console.log ("REQ: ", req);
  console.log ("REQ BODY: ", req.body);
  console.log ("REQ HEADERS: ", req.headers);
  console.log ("REQ COOKIES: ", req.cookies);
  const token = req.cookies.jwt;
  console.log ("TOKEN: ", token);
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
