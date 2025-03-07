# Advanced Library Management System (adv-lms)

## Description
The Advanced Library Management System (adv-lms) is a web application built using Express.js and MongoDB. It provides functionalities for managing a library, including borrowing and returning books, user authentication, and book reviews.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript), Tailwind CSS, Bootstrap
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Deployment:** Vercel

## Functionalities
- **User Authentication:** Sign up, sign in, and sign out.
- **Admin Dashboard:** Create, update, delete books, and manage book returns.
- **User Dashboard:** View borrowed books, previously borrowed books, and submit book reviews and ratings.
- **Book Management:** Borrow and return books.
- **Search:** Search for books by title or author.
- **Book Reviews:** Add ratings and reviews for books.

## Routes Documentation

### Public Routes
- **GET `/`**: Redirects to the sign-in page.
- **GET `/signin`**: Renders the sign-in page.
- **GET `/signup`**: Renders the sign-up page.
- **POST `/signup`**: Handles user registration.
- **POST `/signin`**: Handles user login.
- **POST `/signout`**: Handles user logout.

### Protected Routes (User)
- **GET `/dashboard`**: Renders the user dashboard.
- **GET `/borrow`**: Renders the borrow book page.
- **POST `/borrow`**: Handles borrowing a book.
- **GET `/search`**: Handles book search and renders search results.
- **GET `/book/:book_id`**: Renders book details page.
- **GET `/addRatingReview/:book_id`**: Renders the add rating and review page.
- **POST `/submitRatingReview`**: Handles submitting a rating and review.

### Admin Routes
- **GET `/admin`**: Renders the admin dashboard.
- **GET `/create`**: Renders the create book page.
- **POST `/create`**: Handles creating a new book.
- **GET `/return`**: Renders the return book page.
- **POST `/return`**: Handles returning a book.
- **GET `/update`**: Renders the update book page.
- **POST `/update`**: Handles updating a book.
- **GET `/delete`**: Renders the delete book page.
- **POST `/delete`**: Handles deleting a book.

## Models
- **Book**: Represents a book in the library.
- **Member**: Represents a library member.
- **History**: Represents the borrowing history of books.

## Deployment
The application is configured to be deployed on Vercel. The `vercel.json` file contains the necessary configuration for deployment.

## Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Access the application at `http://localhost:3000`

## Running
For Administrator access use

- UserName: admin0
- Password: admin 

For Member access use

- UserName: titan
- Password: 67yuig
- 
- UserName: GDSC
- Password: members1
-
- UserName: CPmaster
- Password: ctfmaster

## License
This project is licensed under the ISC License.
