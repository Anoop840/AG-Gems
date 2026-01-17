# AG Gems - Security & Configuration Guide

## Critical Security Issues Fixed

### 1. User Model Security ✅
- **Added `select: false`** to sensitive fields:
  - `resetPasswordToken`
  - `resetPasswordExpire`
  - `verificationToken`
  - `passwordChangedAt`
  - `isActive`
- **Added `isActive` field** for proper account deactivation and token revocation

### 2. Authentication Improvements ✅
- **Token Revocation**: Added check for `isActive` status in auth middleware
- **Password Change Timestamp**: Fixed timestamp logic to use proper `Date()` instead of `Date.now() - 1000`
- **Enhanced Verification**: Improved token issued time comparison accuracy

### 3. Payment Security ✅
- **Blockchain Verification**: Added framework for real Ethereum transaction verification
  - Requires `ethers` package installation: `npm install ethers`
  - Set `ETH_RPC_URL` in `.env` file
  - Configure `PAYMENT_WALLET_ADDRESS` for recipient verification
- **Transaction Support**: Added proper error handling and validation for payment updates
- **Consistent Error Responses**: Fixed exchange rate endpoint to always include `success: false`

### 4. Bug Fixes ✅
- **CSRF Endpoint**: Added `/api/csrf-token` endpoint that was missing
- **getSuggestions Fix**: Corrected undefined `endpoint` variable in frontend API
- **Exchange Rate**: Added consistent error response format
- **Frontend/Backend Sync**: Added `walletAddress` to `sanitizeUser` function

### 5. Error Handling ✅
- **Axios Errors**: Added handler for external API failures
- **Razorpay Errors**: Added specific payment error handling
- **Token Expiry**: Added handler for expired JWT tokens

## Production Deployment Checklist

### Environment Variables (Required)
```bash
# .env file - DO NOT commit this file
NODE_ENV=production
JWT_SECRET=<generate-strong-random-string>
SESSION_SECRET=<generate-strong-random-string>
ETH_RPC_URL=<infura-or-alchemy-url>
PAYMENT_WALLET_ADDRESS=<your-eth-wallet>
RAZORPAY_KEY_ID=<your-razorpay-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

### Blockchain Verification Setup

#### Install Required Package
```bash
cd backend
npm install ethers
```

#### Configure RPC Provider
1. Sign up for [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Create a new project
3. Copy the Ethereum Mainnet RPC URL
4. Add to `.env`: `ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

#### Enable Real Verification
In `backend/controllers/payment.controller.js`, the blockchain verification code is commented out.
Once you have:
- Installed `ethers` package
- Set `ETH_RPC_URL` in production
- Set `PAYMENT_WALLET_ADDRESS`

The system will automatically use real verification in production mode.

### Security Best Practices

#### 1. JWT Secret
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Database Backups
Set up automated MongoDB backups before going live.

#### 3. Rate Limiting
Consider adding rate limiting middleware (e.g., `express-rate-limit`).

#### 4. HTTPS Only
Ensure all production traffic uses HTTPS:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### 5. CORS Configuration
Update CORS settings in production:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

## Testing

### Test Token Revocation
```javascript
// Deactivate user
await User.findByIdAndUpdate(userId, { isActive: false });
// Try to use their existing token - should fail with 401
```

### Test Password Change
```javascript
// Change password
await user.save();
// Old tokens should now be invalid
```

### Test Blockchain Verification (Dev Mode)
- Set `NODE_ENV=development`
- System uses mock verification
- Console shows: "⚠️ Demo mode: Using mock blockchain verification"

### Test Blockchain Verification (Prod Mode)
- Set `NODE_ENV=production`
- Set `ETH_RPC_URL` 
- System attempts real verification
- If not configured, returns error

## Migration Notes

### Database Migration
No migration needed - fields are backward compatible:
- `isActive` defaults to `true` for existing users
- Sensitive fields already existed, now just hidden from queries

### Frontend Changes
No breaking changes - `walletAddress` now properly included in user responses.

## Monitoring

### Log Important Events
- Failed blockchain verifications
- Payment status changes
- Account deactivations
- Token revocation events

### Alert Setup
Set up alerts for:
- Multiple failed payment verifications
- Unusual payment amounts
- Failed blockchain connections
- High error rates in payment endpoints

## Support

For blockchain verification issues:
1. Check `ETH_RPC_URL` is valid
2. Verify wallet address format
3. Check RPC provider rate limits
4. Review console logs for detailed errors

For payment issues:
1. Verify Razorpay credentials
2. Check webhook configurations
3. Review transaction logs
4. Test in Razorpay test mode first
