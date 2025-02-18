# Accessriano E-commerce Platform

Accessriano is a modern, full-stack e-commerce platform specializing in accessories. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers a seamless shopping experience with robust admin capabilities.

## Features

### Customer Features
- 🛍️ Browse products by category with advanced filtering
- 🔍 Smart search functionality
- 🛒 Shopping cart management
- 💝 Wishlist functionality
- 👤 User profiles and order history
- 💳 Secure checkout process
- 📱 Responsive design for all devices

### Admin Features
- 📊 Comprehensive dashboard
- 📦 Product management (CRUD operations)
- 🏷️ Category management
- 📋 Order management
- 📈 Sales analytics
- 🔍 Review management

### Technical Features
- 🔐 JWT authentication
- 🛡️ Role-based access control
- 🌐 RESTful API
- 🎨 Material-UI components
- 🔄 Real-time updates
- 📸 Image upload and management

## Prerequisites

Before running this project, make sure you have:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Qadirdad-Kazi/Accessriano-E-commerce.git
cd Accessriano-E-commerce
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a .env file in the server directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Create a .env file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
Accessriano-E-commerce/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/              
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
│
└── README.md
```

## API Documentation

The API documentation is available at `/api-docs` when running the server. It includes:
- Authentication endpoints
- Product management
- Order management
- User management
- Review system
- Category management

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Qadir Dad Kazi - qadirdadkazi@gmail.com
Portfolio - qadirdadkazi.netlify.app

Project Link: https://github.com/Qadirdad-Kazi/Accessriano-E-commerce
