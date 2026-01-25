import express from "express";
import { validationResult } from "express-validator";
import supabase from "../supabase.js";
import { loginClientValidator } from "../validators/registerclient.js";
import dotenv from "dotenv";
import { tokengenerator } from "../utility/helper.js";

dotenv.config();

const router = express.Router();

router.post("/login", loginClientValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userid, password } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("userid,role,password_hash")
      .eq("userid", userid)
      .single();

    if (error) {
      return res.status(404).json({ error: error, message: "User not found" });
    }

    if (data.password_hash !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = tokengenerator({ userid: data.userid, role: data.role });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Login successful",
      data: { userid: data.userid, role: data.role, token: token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
});

export default router;
