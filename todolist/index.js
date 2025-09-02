const express = require("express")
const session = require("express-session")

const app = express()
const port = 3000

// to parse request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// to enable session-express
app.use(session({
  secret: "my-secret-key", 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// array
const users = [{id: 1, username: "admin", password:"admin"}]
const todo = {1: []}

app.get("/", (req, res) => {
  res.send(`
    <h1>CRUD To Do List Login Page</h1>
    <form method="POST" action="/login">
      <label>Username:</label><br>
      <input type="text" name="username" /><br>
      <label>Password:</label><br>
      <input type="password" name="password" /><br><br>
      <form method="POST" action="/login">
      <button type="submit">Login</button><br><br>
      </form>
  `);
});

// login
app.post("/login", (req, res) => {const { username, password } = req.body;
const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).send("Incorrect Username or Password");
  }

req.session.userId = user.id;

  if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
    return res.redirect("/todolist");
  }
});

function isLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).send("Please log in first...");
  }
  next();
}

app.get("/todolist", isLogin, (req, res) => {const userId= req.session.userId ;
    const toDoLists=todo[userId] || [];


if (req.headers.accept?.includes("text/html")) {
    return res.send(`
      <h2>Your To Do List</h2>
      <ul>${toDoLists.map(t => `<li>${t}</li>`).join("")}</ul>
      <form method="POST" action="/todolist">
        <input type="text" name="task" placeholder="New todo" />
        <button type="submit">Create</button>
      </form>
      <form method="POST" action="/logout">
        <button type="submit">Logout</button>
      </form>
      <form method="POST" action="/delete">
      <button type="submit">Delete Recent Add</button>
      </form>
    `);
  }
});

// add todo
app.post("/todolist", (req, res) => {
  const userId = req.session.userId;
  const { task } = req.body;

  todo[userId].push(task);

  if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
    return res.redirect("/todolist");
  }
});

// delete todo
app.get("/delete", isLogin, (req, res) => {const userId= req.session.userId ;
    const toDoLists=todo[userId] || [];


if (req.headers.accept?.includes("text/html")) {
    return res.send(`
      <h1>Your To Do List</h1>
      <ul>${toDoLists.map(t => `<li>${t}</li>`).join("")}</ul>
      <form method="POST" action="/delete">
        <input type="text" name="deleteto" placeholder="todolist" />
        <button type="submit">Delete</button>
      </form>
      <form method="POST" action="/logout">
        <button type="submit">Logout</button>
      </form>
    `);
  }
});

// delete recent added to do task
app.post("/delete", (req, res) => {
  const userId = req.session.userId;
  const { task } = req.body;

  todo[userId].pop(task);

  if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
    return res.redirect("/todolist");
  }
 })

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.send("Logged out successfully");
  });
});

app.listen(port, () => {
    console.log("Access through Web")
})
