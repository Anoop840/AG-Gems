# MERN E-Commerce Application

A full-stack e-commerce application built with MongoDB, Express.js, React (Next.js), and Node.js.

## Features

### User Features
- User registration and authentication with JWT
- Product browsing with search and filtering
- Product detail pages with image galleries
- Shopping cart functionality
- Secure checkout process
- Order history and tracking
- Responsive design for mobile and desktop

### Admin Features
- Admin dashboard with statistics
- Product management (CRUD operations)
- Order management and status updates
- User management

### Technical Features
- Secure JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API protection
- CORS configuration
- MongoDB database with proper indexing
- Responsive UI with Tailwind CSS
- Image upload functionality
- Real-time cart updates

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **Next.js** - React framework
- **React** - UI library
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **js-cookie** - Cookie management
- **react-hot-toast** - Notifications

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-ecommerce
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

5. **Seed Sample Data**
   ```bash
   cd backend
   npm run seed
   ```

## Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/health

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## Default Users

After running the seed script, you can log in with these default accounts:

### Admin User
- Email: admin@example.com
- Password: admin123

### Regular User
- Email: user@example.com
- Password: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products (with pagination, filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/pay` - Update order payment status

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/deliver` - Mark order as delivered
- `GET /api/admin/users` - Get all users

## Project Structure

```
mern-ecommerce/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── scripts/         # Database scripts
│   └── server.js        # Main server file
├── frontend/
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── styles/          # Global styles
│   └── public/          # Static assets
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with helmet
- MongoDB injection protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.