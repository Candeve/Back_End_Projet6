// controllers/users.controller.js
const express = require("express");
const User = require("../models/User").User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usersRouter = express.Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);

async function signUp(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont obligatoires" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "L'email existe déjà" });
    }
    const hashedPassword = hashPassword(password);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Inscription réussie" });
  } catch (e) {
    console.error("Erreur lors de l'inscription:", e);
    return res.status(500).json({ message: "Une erreur est survenue", error: e.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont obligatoires" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Mot de passe incorrect");
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    const token = generateToken(user._id);
    res.status(200).json({ userId: user._id, token });
  } catch (e) {
    console.error("Erreur lors de la connexion:", e);
    return res.status(500).json({ message: "Une erreur est survenue", error: e.message });
  }
}

function generateToken(userId) {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(8); // Salt à 8
  return bcrypt.hashSync(password, salt);
}

module.exports = usersRouter;
