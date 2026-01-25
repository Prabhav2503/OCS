import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const tokengenerator = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

export const verifytoken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error({msg:"Invalid token", error:err});
  }
};
