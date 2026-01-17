# AG Gems E-Commerce - Complete Deployment Guide

## Pre-Deployment Checklist

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment Variables
Create `backend/.env` file:

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ag-gems

# Security
JWT_SECRET=<generate-64-char-random-string>
SESSION_SECRET=<generate-64-char-random-string>

# Payment - Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Blockchain (for crypto payments)
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PAYMENT_WALLET_ADDRESS=0xYourEthereumWalletAddress

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@aggems.com
```

#### Frontend Environment Variables
Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 3. Generate Secure Secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Setup External Services

#### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses (or allow from anywhere for testing)
5. Get connection string and add to `MONGODB_URI`

#### Razorpay
1. Sign up at [Razorpay](https://razorpay.com/)
2. Complete KYC verification
3. Get API keys from Dashboard
4. Enable required payment methods
5. Configure webhook (optional)

#### Infura/Alchemy (for Blockchain)
1. Sign up at [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Create new project
3. Select Ethereum Mainnet
4. Copy HTTP endpoint URL
5. Add to `ETH_RPC_URL`

#### Cloudinary (for Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get Cloud Name, API Key, and API Secret from Dashboard
3. Configure upload presets if needed

## Security Hardening

### 1. Enable HTTPS
Use Let's Encrypt or your hosting provider's SSL:

```bash
# Example with Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 2. Configure CORS Properly
In `backend/server.js`, ensure CORS is restricted:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
```

### 3. Rate Limiting
Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Helmet Security Headers
Already configured in `server.js`:

```javascript
app.use(helmet());
```

## Database Setup

### 1. Seed Initial Data
```bash
cd backend
npm run seed
```

This will create:
- Categories
- Sample products
- Admin user (if configured)

### 2. Create Indexes
MongoDB should auto-create indexes, but verify:

```javascript
// In MongoDB shell or Compass
db.users.createIndex({ email: 1 }, { unique: true })
db.products.createIndex({ name: "text", description: "text" })
db.orders.createIndex({ user: 1, createdAt: -1 })
```

## Testing

### 1. Test Backend API

```bash
cd backend
npm run dev
```

Test endpoints:
```bash
# Health check
curl http://localhost:5000/api/health

# CSRF token
curl http://localhost:5000/api/csrf-token

# Get products (should work)
curl http://localhost:5000/api/products

# Try authenticated endpoint (should fail without token)
curl http://localhost:5000/api/cart
```

### 2. Test Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and test:
- [ ] User registration
- [ ] User login
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Payment (use test keys)
- [ ] Order confirmation

### 3. Test Blockchain Verification (Development)

With `NODE_ENV=development`:
```bash
# Backend will use mock verification
# Console will show: "⚠️ Demo mode: Using mock blockchain verification"
```

### 4. Test Blockchain Verification (Production)

With `NODE_ENV=production` and proper configuration:
1. Make a real transaction to your wallet
2. Get the transaction hash
3. Submit payment with that hash
4. Backend will verify on blockchain
5. Check logs for verification details

## Production Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

#### Deploy Backend to Railway
1. Push code to GitHub
2. Connect Railway to your repository
3. Add environment variables
4. Deploy

### Option 2: Single VPS (DigitalOcean, AWS EC2)

#### Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
# Follow: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

#### Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/ag-gems.git
cd ag-gems

# Backend
cd backend
npm install --production
pm2 start server.js --name ag-gems-api

# Frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name ag-gems-web -- start
```

#### Configure Nginx
```nginx
# /etc/nginx/sites-available/ag-gems
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/ag-gems /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring & Maintenance

### 1. Setup PM2 Monitoring
```bash
pm2 startup
pm2 save
pm2 install pm2-logrotate
```

### 2. Monitor Logs
```bash
# Backend logs
pm2 logs ag-gems-api

# System logs
tail -f /var/log/nginx/error.log
```

### 3. Database Backups
```bash
# Automated MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb_$DATE"
find /backups -mtime +7 -delete  # Keep 7 days
```

### 4. Health Checks
Setup monitoring with:
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)
- [DataDog](https://www.datadoghq.com/)

Monitor:
- API health endpoint: `/api/health`
- Frontend homepage
- Database connections
- Payment gateway status

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs ag-gems-api

# Check environment variables
pm2 env 0

# Test manually
cd backend
node server.js
```

### Frontend build fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database connection issues
```bash
# Test connection
node -e "require('mongoose').connect('$MONGODB_URI').then(() => console.log('Connected')).catch(err => console.error(err))"
```

### Blockchain verification fails
```bash
# Check RPC endpoint
curl $ETH_RPC_URL -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check wallet address format
node -e "console.log(require('ethers').isAddress('$PAYMENT_WALLET_ADDRESS'))"
```

### Payment issues
1. Verify Razorpay keys are correct
2. Check Razorpay dashboard for transaction status
3. Ensure webhook endpoints are configured (if using)
4. Test with Razorpay test mode first

## Rollback Procedure

### Quick Rollback
```bash
# Backend
cd backend
git checkout <previous-commit>
pm2 restart ag-gems-api

# Frontend
cd frontend
git checkout <previous-commit>
npm run build
pm2 restart ag-gems-web
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /backups/mongodb_YYYYMMDD_HHMMSS
```

## Support & Resources

- [Security Fixes Documentation](./SECURITY_FIXES.md)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] Database backed up
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Test user flows
- [ ] Test payment integration (with test keys first)
- [ ] Test blockchain verification (in dev mode first)
- [ ] Admin panel accessible
- [ ] Email notifications working
- [ ] Mobile responsiveness verified
- [ ] Performance testing completed
- [ ] Security audit performed

## Maintenance Schedule

### Daily
- Check error logs
- Monitor payment transactions
- Verify blockchain verification success rate

### Weekly
- Database backup verification
- Security updates
- Performance monitoring

### Monthly
- Full security audit
- Database optimization
- Review and rotate API keys (if needed)
- Update dependencies

---

**Need Help?** Check [SECURITY_FIXES.md](./SECURITY_FIXES.md) for detailed security information and troubleshooting.
