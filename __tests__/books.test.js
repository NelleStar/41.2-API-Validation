process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// isbn of sample book
let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123456789',
        'https://amazon.com/thisisabook',
        'JKHouston',
        'English',
        450,
        'Pretend',
        'A Book Title', 
        2023)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn;
});

// Test the GET routes first - both ALL books and SINGLE books
describe("GET /books", () => {
    test("Get a list of books", async function() {
        const response  = await request(app).get("/books");
        expect(response.status).toBe(200);
        expect(response.body.books[0]).toHaveProperty('isbn');
        expect(response.body.books[0]).toHaveProperty('author');
    });
});

describe("GET /books/;isbn", () => {
  test("Get a single book", async function () {
    const response = await request(app).get(`/books/${book_isbn}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("book");
    expect(response.body.book).toHaveProperty("author");
  });
});

describe("PUT /books/:id", function () {
  test("Updates a single book", async function () {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "UPDATED BOOK",
          year: 2000
        });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });