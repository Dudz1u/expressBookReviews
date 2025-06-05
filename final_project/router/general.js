const express = require('express');
let books = require("../booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --- PROMISE-BASED helper functions ---
function getBooks() {
  return new Promise((resolve) => {
    resolve(books);
  });
}

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const matches = [];
    for (let isbn in books) {
      if (books[isbn].author === author) {
        matches.push({ isbn, ...books[isbn] });
      }
    }
    matches.length ? resolve(matches) : reject("No books found for this author");
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const matches = [];
    for (let isbn in books) {
      if (books[isbn].title === title) {
        matches.push({ isbn, ...books[isbn] });
      }
    }
    matches.length ? resolve(matches) : reject("No books found with this title");
  });
}

// --- TASK 6: Register new user ---
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// --- TASK 1 & 10: Get all books (async-await version) ---
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getBooks();
    res.status(200).send(JSON.stringify(allBooks, null, 2));
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// --- TASK 2 & 11: Get book by ISBN (async-await version) ---
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = await getBookByISBN(req.params.isbn);
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// --- TASK 3 & 12: Get books by author (async-await version) ---
public_users.get('/author/:author', async (req, res) => {
  try {
    const booksByAuthor = await getBooksByAuthor(req.params.author);
    res.status(200).json(booksByAuthor);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// --- TASK 4 & 13: Get books by title (async-await version) ---
public_users.get('/title/:title', async (req, res) => {
  try {
    const booksByTitle = await getBooksByTitle(req.params.title);
    res.status(200).json(booksByTitle);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// --- TASK 5: Get reviews ---
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this ISBN" });
  }
});

module.exports.general = public_users;
