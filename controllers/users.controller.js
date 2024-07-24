// Nous importons les modules nécessaires
const express = require("express");
const User = require("../models/User").User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Nous créons un routeur Express pour les utilisateurs
const usersRouter = express.Router();

// Nous définissons les routes et les associons aux fonctions correspondantes
usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);

// Fonction pour inscrire un utilisateur
async function signUp(req, res) {
  const { email, password } = req.body; // Récupère l'email et le mot de passe du corps de la requête
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont obligatoires" }); // Vérifie si l'email et le mot de passe sont présents
  }

  try {
    const existingUser = await User.findOne({ email }); // Cherche un utilisateur avec cet email
    if (existingUser) {
      return res.status(400).json({ message: "L'email existe déjà" }); // Vérifie si l'utilisateur existe déjà
    }
    const hashedPassword = hashPassword(password); // Hash le mot de passe
    const user = new User({ email, password: hashedPassword }); // Crée un nouvel utilisateur
    await user.save(); // Sauvegarde l'utilisateur dans la base de données
    res.status(201).json({ message: "Inscription réussie" }); // Retourne un message de succès
  } catch (e) {
    console.error("Erreur lors de l'inscription:", e); // Log l'erreur
    return res.status(500).json({ message: "Une erreur est survenue", error: e.message }); // Retourne une erreur
  }
}

// Fonction pour connecter un utilisateur
async function login(req, res) {
  const { email, password } = req.body; // Récupère l'email et le mot de passe du corps de la requête
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont obligatoires" }); // Vérifie si l'email et le mot de passe sont présents
  }
  try {
    const user = await User.findOne({ email }); // Cherche un utilisateur avec cet email
    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(401).json({ message: "Identifiants incorrects" }); // Vérifie si l'utilisateur existe
    }
    const isMatch = await bcrypt.compare(password, user.password); // Compare le mot de passe hashé
    if (!isMatch) {
      console.log("Mot de passe incorrect");
      return res.status(401).json({ message: "Identifiants incorrects" }); // Vérifie si le mot de passe est correct
    }

    const token = generateToken(user._id); // Génère un token JWT
    res.status(200).json({ userId: user._id, token }); // Retourne l'ID de l'utilisateur et le token
  } catch (e) {
    console.error("Erreur lors de la connexion:", e); // Log l'erreur
    return res.status(500).json({ message: "Une erreur est survenue", error: e.message }); // Retourne une erreur
  }
}

// Fonction pour générer un token JWT
function generateToken(userId) {
  const payload = { userId }; // Crée le payload du token
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }); // Génère le token avec une expiration de 1 jour
}

// Fonction pour hasher un mot de passe
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(8); // Génère un salt de 8
  return bcrypt.hashSync(password, salt); // Crée un hash sécurisé du mot de passe en utilisant le salt
}

// Nous exportons le routeur des utilisateurs
module.exports = usersRouter;
