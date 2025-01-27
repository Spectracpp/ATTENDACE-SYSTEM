const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;

    if (decoded.type === "user") {
      user = await User.findOne({ _id: decoded.id });
    } else if (decoded.type === "admin") {
      user = await Admin.findOne({ _id: decoded.id });
    }

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    req.userType = decoded.type;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
