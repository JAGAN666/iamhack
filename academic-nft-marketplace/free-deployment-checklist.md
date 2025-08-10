# ✅ Free Deployment Checklist

## Pre-Deployment Setup

### 1. Account Creation (All Free)
- [ ] **Vercel Account**: Sign up at [vercel.com](https://vercel.com) with GitHub
- [ ] **Railway Account**: Sign up at [railway.app](https://railway.app) with GitHub  
- [ ] **Supabase Account**: Sign up at [supabase.com](https://supabase.com) with GitHub
- [ ] **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
- [ ] **EmailJS Account**: Sign up at [emailjs.com](https://emailjs.com)
- [ ] **Alchemy Account**: Sign up at [alchemy.com](https://alchemy.com)

### 2. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure all sensitive data is in `.env` files (not committed)
- [ ] Add deployment configuration files (vercel.json, railway.json)

## Database Deployment (Supabase - FREE)

### 3. Supabase Setup
- [ ] Create new Supabase project: "academic-nft-marketplace"
- [ ] Copy connection string from Settings > Database
- [ ] Run the SQL setup script in SQL Editor:
  ```sql
  -- Copy content from supabase-setup.sql
  ```
- [ ] Verify tables are created in Table Editor
- [ ] Test connection with provided demo data

## Backend Deployment (Railway - FREE)

### 4. Railway Setup
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Navigate to backend: `cd backend`
- [ ] Initialize: `railway init`
- [ ] Deploy: `railway up`

### 5. Environment Variables (Railway Dashboard)
- [ ] `DATABASE_URL`: Your Supabase connection string
- [ ] `JWT_SECRET`: Generate random 32-character string
- [ ] `FRONTEND_URL`: Will be your Vercel URL (add after frontend deploy)
- [ ] `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard
- [ ] `CLOUDINARY_API_KEY`: From Cloudinary dashboard
- [ ] `CLOUDINARY_API_SECRET`: From Cloudinary dashboard
- [ ] `POLYGON_RPC_URL`: From Alchemy dashboard
- [ ] `PRIVATE_KEY`: Your wallet private key (for contract deployment)
- [ ] `PORT`: 3001

### 6. Test Backend
- [ ] Visit your Railway app URL
- [ ] Check `/api/health` endpoint returns OK
- [ ] Verify database connection works

## Frontend Deployment (Vercel - FREE)

### 7. Vercel Setup
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate to frontend: `cd frontend`
- [ ] Deploy: `vercel --prod`
- [ ] Link to GitHub repository when prompted

### 8. Environment Variables (Vercel Dashboard)
- [ ] `NEXT_PUBLIC_API_URL`: Your Railway backend URL
- [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID`: From EmailJS dashboard
- [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`: From EmailJS dashboard  
- [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`: From EmailJS dashboard
- [ ] `NEXT_PUBLIC_POLYGON_RPC_URL`: Your Alchemy Polygon Mumbai URL

### 9. Update Backend FRONTEND_URL
- [ ] Copy your Vercel app URL
- [ ] Update `FRONTEND_URL` in Railway environment variables
- [ ] Redeploy backend: `railway up`

## File Storage Setup (Cloudinary - FREE)

### 10. Cloudinary Configuration
- [ ] Create upload preset in Cloudinary dashboard
- [ ] Set upload preset to "unsigned" for direct uploads
- [ ] Configure folder structure: `/academic-nft/achievements/`
- [ ] Test image upload from frontend

## Email Service Setup (EmailJS - FREE)

### 11. EmailJS Configuration
- [ ] Create email service (Gmail/Outlook)
- [ ] Create email template for verification emails
- [ ] Test email sending from frontend contact form
- [ ] Verify emails are delivered

## Blockchain Setup (Polygon Mumbai - FREE)

### 12. Smart Contract Deployment
- [ ] Get Mumbai testnet MATIC from faucet
- [ ] Deploy contracts: `cd contracts && npm run deploy:mumbai`
- [ ] Update contract addresses in backend environment
- [ ] Test NFT minting functionality

## Testing & Verification

### 13. End-to-End Testing
- [ ] **Registration**: Test with university email
- [ ] **Email Verification**: Check email delivery and verification
- [ ] **Achievement Upload**: Test file upload to Cloudinary
- [ ] **NFT Minting**: Test blockchain integration
- [ ] **Opportunities**: Test access control system
- [ ] **Real-time Features**: Test WebSocket connections

### 14. Performance Testing
- [ ] **Page Load Speed**: < 3 seconds on 3G
- [ ] **API Response Time**: < 500ms average
- [ ] **Image Loading**: Optimized and compressed
- [ ] **Mobile Responsiveness**: Test on various devices

## Monitoring Setup (FREE)

### 15. Analytics & Monitoring
- [ ] **Vercel Analytics**: Automatic with deployment
- [ ] **Sentry Error Tracking**: Install and configure
- [ ] **Uptime Monitoring**: Setup with UptimeRobot
- [ ] **Performance Monitoring**: Configure Web Vitals

## Security Checklist

### 16. Security Verification
- [ ] **HTTPS**: Automatic with Vercel/Railway
- [ ] **CORS**: Properly configured for your domain
- [ ] **Rate Limiting**: Enabled in backend
- [ ] **Input Validation**: All forms validated
- [ ] **SQL Injection**: Using Prisma ORM protection
- [ ] **XSS Protection**: React built-in protection

## Documentation

### 17. Final Documentation
- [ ] Update README with live URLs
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Add troubleshooting section

## Go Live!

### 18. Launch Checklist
- [ ] **Custom Domain**: Optional (free .vercel.app works)
- [ ] **Social Media**: Share your launch
- [ ] **Demo Video**: Record walkthrough
- [ ] **Feedback Collection**: Setup user feedback system

## 🎯 Success Metrics

After deployment, you should have:
- ✅ **Frontend**: Live on Vercel with custom domain
- ✅ **Backend**: API running on Railway
- ✅ **Database**: PostgreSQL on Supabase with demo data
- ✅ **Storage**: Images hosted on Cloudinary
- ✅ **Email**: Verification emails working
- ✅ **Blockchain**: Smart contracts on Polygon Mumbai
- ✅ **Monitoring**: Error tracking and analytics
- ✅ **Security**: HTTPS, CORS, rate limiting

## 💰 Total Cost: $0

All services are within free tier limits and can handle:
- **10,000+ monthly visitors**
- **1,000+ registered users**  
- **50,000+ API requests**
- **25GB file storage**
- **500MB database**

Perfect for MVP launch and initial user acquisition!

## 🆘 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify connection string format
3. **CORS Errors**: Ensure FRONTEND_URL is correctly set
4. **Email Not Sending**: Check EmailJS service configuration
5. **Images Not Loading**: Verify Cloudinary upload preset

### Support Resources:
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: GitHub Issues and Discord servers

## 🚀 Next Steps

Once deployed:
1. **User Testing**: Get feedback from real users
2. **Performance Optimization**: Monitor and improve
3. **Feature Expansion**: Add requested features
4. **Scaling**: Upgrade services as you grow
5. **Monetization**: Add premium features when ready

Your Academic NFT Marketplace is now live and ready to change the world! 🎓✨