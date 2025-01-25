const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		if (isValid(username) === false) {
			users.push({ username: username, password: password });
			return res
				.status(200)
				.json({ message: "Successful user registration" });
		} else {
			return res.status(404).json({ message: "User already exisits!" });
		}
	}
	return res
		.status(404)
		.json({ message: "A username or password was missing" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
	try {
		const booksPromise = await new Promise((resolve, reject) => {
			resolve(JSON.stringify(books, null, 4));
		});
		res.send(booksPromise);
	} catch (err) {
		res.status(500).send("An error occured");
	}
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
	const reqISBN = req.params.isbn;
	try {
		await new Promise((resolve, reject) => {
			if (typeof books[reqISBN] !== "undefined") {
				resolve();
			} else {
				reject();
			}
		});
		res.send(JSON.stringify(books[reqISBN], null, 4));
	} catch (err) {
		res.status(404).json({
			message: `Could not identify a book with the ISBN ${reqISBN}`,
		});
	}
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
	// Example URL: http://localhost:5000/author/hans_christian_andersen
	let author = req.params.author;

	author = author
		.replace(/_/g, " ")
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	try {
		const booksByAuthor = await new Promise((resolve, reject) => {
			// Book keys
			const bookKeys = Object.keys(books);

			// Filter books to match the author
			const matchingBooks = bookKeys
				.filter((key) => books[key].author === author)
				.map((key) => books[key]);

			if (matchingBooks.length > 0) {
				resolve(matchingBooks);
			} else {
				reject(`No books found by author: ${author}`);
			}
		});

		res.send(JSON.stringify(booksByAuthor, null, 4));
	} catch (err) {
		res.status(404).json({ message: err });
	}
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
	let title = req.params.title;

	title = title
		.replace(/_/g, " ")
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	try {
		const booksByTitle = await new Promise((resolve, reject) => {
			// Book keys
			const booksKeys = Object.keys(books);

			// Filter to match the author
			const matchingBooks = booksKeys
				.filter((key) => books[key].title === title)
				.map((key) => books[key]);

			if (matchingBooks.length > 0) {
				resolve(matchingBooks);
			} else {
				reject(`No books found by title: ${title}`);
			}
		});

		res.send(JSON.stringify(booksByTitle, null, 4));
	} catch (err) {
		res.status(404).json({ message: err });
	}
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
	const reqISBN = req.params.isbn;
	try {
		const reviews = await new Promise((resolve, reject) => {
			if (books[reqISBN]) {
				resolve(books[reqISBN].reviews);
			} else {
				reject(`No book found with ISBN: ${reqISBN}`);
			}
		});

		res.send(JSON.stringify(reviews, null, 4));
	} catch (err) {
		res.status(404).json({ message: err });
	}
});

module.exports.general = public_users;
