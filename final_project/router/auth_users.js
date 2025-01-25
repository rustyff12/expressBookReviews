const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	const usernameQuerry = users.filter((user) => {
		return user.username === username;
	});

	if (usernameQuerry.length > 0) {
		return true;
	} else {
		return false;
	}
};

const authenticatedUser = (username, password) => {
	const validusers = users.filter((user) => {
		return user.username === username && user.password === password;
	});

	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	// Missing password or username
	if (!username || !password) {
		return res
			.status(404)
			.json({ message: "A username or password was missing" });
	}

	// Check authentication
	if (authenticatedUser(username, password)) {
		// JWT token
		const accessToken = jwt.sign({ data: password }, "access", {
			expiresIn: 60 * 60,
		});

		req.session.authorization = {
			accessToken,
			username,
		};
		return res.status(200).json({
			message: "User successfully ligged in",
			accessToken: accessToken,
		});
	} else {
		return res
			.status(208)
			.json({ message: "Invalid login, please try again" });
	}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const reqISBN = req.params.isbn;
	const reqReview = req.body.review;
	const user = req.session.authorization.username;

	const reviews = books[reqISBN].reviews || {};
	let message = "";

	if (typeof reviews[user] === "undefined") {
		message = `Hey ${user}, your review was added to the book with the ISBN ${reqISBN}.`;
	} else {
		message = `Hey ${user}, you updated your review of the book with the ISBN ${reqISBN}.`;
	}
	reviews[user] = reqReview;
	books[reqISBN].reviews = reviews;

	res.send(message);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	const reqISBN = req.params.isbn;
	const user = req.session.authorization.username;

	// Check for book
	if (!books[reqISBN]) {
		return res
			.status(404)
			.json({ message: `Book with ISBN ${reqISBN} not found` });
	}

	const bookReviews = books[reqISBN].reviews;

	// Check for review
	if (!bookReviews || typeof bookReviews[user] === "undefined") {
		return res.status(404).json({
			message: `No review found for  user ${user} on the book with ISBN ${reqISBN}`,
		});
	}

	delete bookReviews[user];
	books[reqISBN].reviews = bookReviews;

	res.json({
		message: `The review for the book with ISBN ${reqISBN} was successfully deleted.`,
	});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
