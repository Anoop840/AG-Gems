# AG-Gems (Aurum Luxe) - AI Coding Agent Instructions

## Project Architecture

**Full-stack jewelry e-commerce platform** with:
- **Backend**: Node.js/Express REST API (`/backend`) - CommonJS modules
- **Frontend**: Next.js 16 with TypeScript, App Router (`/frontend`) - React 18
- **Database**: MongoDB with Mongoose ODM
- **Payment**: Razorpay integration for Indian market (INR currency)
- **Web3**: MetaMask wallet integration via ethers.js

## Critical Setup & Workflows

### First-Time Setup
```bash
# Backend
cd backend
npm install
# Create .env: MONGODB_URI, JWT_SECRET, PORT, RAZORPAY_KEY_ID/SECRET, EMAIL_* configs
npm run seed  # Creates categories, 20 sample products, admin user

# Frontend  
cd frontend
npm install
# Create .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

**Default admin**: `admin@jewelry.com` / `admin123`

### Running Dev Environment
- Backend: `npm run dev` (port 5000, nodemon)
- Frontend: `npm run dev` (port 3000)
- Both must run simultaneously for full functionality

## Key Architectural Patterns

### Authentication Flow
- **JWT-based**: Tokens stored in `localStorage` (see `frontend/lib/api.ts`)
- **Middleware**: `backend/middleware/auth.js` exports `protect` (auth) and `authorize(...roles)` (RBAC)
- **Password reset**: Uses crypto tokens with 1-hour expiry, sent via nodemailer
- Routes use `protect` middleware, admin routes add `authorize('admin')`

### Frontend Data Layer
**Centralized API client** (`frontend/lib/api.ts`):
- Single `apiRequest<T>()` helper handles auth headers, error parsing
- Organized sub-APIs: `authAPI`, `cartAPI`, `orderAPI`, `productAPI`, `categoryAPI`, `paymentAPI`
- **Always use these helpers**, not raw fetch/axios

**React Context Providers** (wrap in `app/layout.tsx`):
- `AuthContext` - Current user state, login/logout
- `CartContext` - Cart state management, syncs with backend
- `WalletConnect` (JSX file) - MetaMask integration for Web3 features

### Backend Routing Convention
All routes under `/api/*`:
```javascript
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
// etc. - see server.js for complete list
```

## Product Data Structure
Products have rich jewelry-specific fields (see `models/Product.js`):
- `metal: { type, purity, weight }` - e.g., "18K gold, 5.2g"
- `gemstones[]` - carat, clarity, color, cut
- `material` enum: gold/silver/platinum/diamond/gemstone
- `images[]` with `isPrimary` flag
- Text search indexed on: name, description, tags

**Filtering/pagination**: Products route accepts query params - `page`, `limit`, `category`, `minPrice`, `maxPrice`, `material`, `sort`, `search`

## File Upload Handling
- Route: `backend/routes/upload.js` with Multer middleware
- Integrates Cloudinary for image storage
- Products expect image arrays with `{ url, alt, isPrimary }`

## Payment Flow (Razorpay)
1. Frontend calls `paymentAPI.createRazorpayOrder(amount, orderId)`
2. Backend creates Razorpay order, returns `orderId`
3. Frontend shows Razorpay checkout modal
4. On success, frontend calls `paymentAPI.verifyPayment()` with signature
5. Backend verifies HMAC signature, updates Order status to 'paid'/'confirmed'

## Common Gotchas

### Import Path Aliases
- Frontend uses `@/` alias → maps to `frontend/` root (see `tsconfig.json`)
- Example: `import { Button } from '@/components/ui/button'`

### Wallet Integration
- Lives in `frontend/context/WalletConnect.jsx` (JSX not TSX!)
- Must wrap app in `<WalletProvider>` before using `useWallet()` hook
- Provides: `account`, `balance`, `chainId`, `connectWallet()`, `disconnectWallet()`

### Model Relationships
- Products reference Categories by ObjectId (`ref: 'Category'`)
- Cart items embed product snapshots (price, quantity) + reference full Product
- Orders store item snapshots (don't rely on Product changes after order)
- User has embedded `addresses[]` array (not separate collection)

### Mongoose Pre-Save Hooks
- User model auto-hashes passwords on save (bcrypt, cost 12)
- Always use `User.create()` or check `isModified('password')` before re-hashing

## UI Component Library
Frontend uses **shadcn/ui** (Radix + Tailwind):
- Components in `frontend/components/ui/*`
- Uses `class-variance-authority` for variants
- Lucide React for icons
- Theme via `next-themes` (dark mode support)

## Seeding & Test Data
Run `npm run seed` in backend to reset DB with:
- 5 categories (Rings, Necklaces, Earrings, Bracelets, Anklets)
- 20 products (4 per category) with realistic jewelry data
- Admin user for testing RBAC

## Security Features
- Helmet for security headers
- Express-rate-limit: 100 req/15min per IP on `/api/*`
- CORS configured for `FRONTEND_URL` (default: localhost:3000)
- Input validation via express-validator (check individual routes)
- Password reset tokens SHA-256 hashed before storage

## Environment Variables

**Backend** (`.env`):
```
MONGODB_URI, JWT_SECRET, PORT, NODE_ENV
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
FRONTEND_URL
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_RAZORPAY_KEY_ID (for client-side Razorpay)
```

## When Modifying Code

- **Adding routes**: Register in `server.js` + protect with middleware if needed
- **New Mongoose models**: Add text indexes for searchable fields
- **Frontend API calls**: Extend `lib/api.ts` helpers, don't inline fetch
- **UI components**: Check `components/ui/*` before creating custom components
- **Auth-required pages**: Use `useAuth()` hook, redirect if `!user`
- **Cart operations**: Update via CartContext methods to keep state synced
