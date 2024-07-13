require("dotenv").config();
const app = require("./operation/app");
const usersRouter = require("./controllers/users.controller");
const booksRouter = require("./controllers/books.controller");

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Le serveur fonctionne!"));

app.use("/api/auth", usersRouter);
app.use("/api/books", booksRouter);

app.listen(PORT, () => console.log(`Le serveur fonctionne sur le port : ${PORT}`));
