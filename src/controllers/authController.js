import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "Account created", user: { id: user._id, name, email } });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    const valid = user && await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ message: "Email or password is incorrect" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
}

export function getMe(req, res) {
  res.json({ user: req.user });
}

export function refreshToken(req, res) {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
}
