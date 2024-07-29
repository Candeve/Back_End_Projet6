// Charge les variables d'environnement depuis un fichier .env
require("dotenv").config();
// Nous importons l'application Express
const app = require("./operation/app");
// Nous importons les routeurs des utilisateurs et des livres
const usersRouter = require("./controllers/users.controller");
const booksRouter = require("./controllers/books.controller");

const PORT = process.env.PORT || 4000; // Définit le port sur lequel l'application va écouter

app.get("/", (req, res) => res.send("Le serveur fonctionne!")); // Définit une route pour la page d'accueil

// Utilise les routeurs pour les routes d'authentification et de livres
app.use("/api/auth", usersRouter);
app.use("/api/books", booksRouter);

// Démarre le serveur et écoute sur le port défini
app.listen(PORT, () => console.log(`Le serveur fonctionne sur le port : ${PORT}`));
