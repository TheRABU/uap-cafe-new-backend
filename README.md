# Restaurant Management System Frontend

Welcome to the frontend repository of the Restaurant Management System, built using the MERN stack. This project enables users to purchase food items, order custom food requests, review foods, and review the restaurant itself. Users can also view all reviews posted by other clients. The application uses Firebase for user authentication and Tailwind CSS for responsive layouts.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [DevDependencies](#devdependencies)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Firebase authentication with Google login and email sign-up.
- **Food Purchase**: Users can browse and purchase food items.
- **Custom Food Requests**: Users can order custom food items.
- **Reviews**: Users can review food items and the restaurant. They can also see reviews from other clients.
- **Responsive Design**: Tailwind CSS ensures a responsive and modern layout.

## Technologies Used
- **React**: A JavaScript library for building user interfaces.
- **Firebase**: For user authentication.
- **Tailwind CSS**: For styling and responsive design.
- **Axios**: For making HTTP requests.
- **React Router**: For routing.
- **React Query**: For data fetching, caching, and synchronization.
- **AOS**: For scroll animations.
- **Framer Motion**: For animations.
- **React Helmet**: For managing document head.
- **SweetAlert2**: For alert messages.
- **Swiper**: For carousels and sliders.

Usage
Sign Up / Log In: Users can sign up or log in using their Google account or email.
Browse Food Items: Browse available food items and add them to the cart.
Order Custom Food: Place custom food requests.
Leave Reviews: Review purchased food items and the restaurant.
View Reviews: View reviews left by other users.
API Endpoints
Authentication
POST /api/auth/register: Register a new user.
POST /api/auth/login: Log in an existing user.
Food Items
GET /api/foods: Get all food items.
POST /api/foods: Add a new food item.
PUT /api/foods/
: Update a food item.
DELETE /api/foods/
: Delete a food item.
Custom Food Requests
POST /api/custom-foods: Create a custom food request.
GET /api/custom-foods: Get all custom food requests.
Reviews
POST /api/reviews: Add a review.
GET /api/reviews: Get all reviews.
Database Collections
Users: Stores user information and authentication details.
Foods: Stores food items available for purchase.
CustomFoods: Stores custom food order requests.
Reviews: Stores reviews for food items and the restaurant.
