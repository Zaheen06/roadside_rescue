# Razorpay Payment Integration Setup Guide

## Prerequisites

1. **Razorpay Account**: Sign up at https://razorpay.com
2. **API Keys**: Get your API keys from Razorpay Dashboard

## Setup Steps

### 1. Get Razorpay API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** > **API Keys**
3. Generate **Test Keys** (for development) or use **Live Keys** (for production)
4. Copy your **Key ID** and **Key Secret**

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Important:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is used in the frontend (public)
- `RAZORPAY_KEY_SECRET` is used only on the server (never expose to client)

### 3. Restart Development Server

```bash¸
npm run dev
```

## How It Works

### Payment Flow

1. **User clicks "Pay Now"**
   - Frontend calls `/api/payment/create-order`
   - Server creates Razorpay order
   - Order ID is stored in database

2. **Razorpay Checkout Opens**
   - User enters payment details
   - Payment is processed by Razorpay

3. **Payment Success**
   - Razorpay returns payment details
   - Frontend calls `/api/payment/verify`
   - Server verifies payment signature
   - Payment status updated in database

### Components

- **PaymentButton**: Reusable payment button component
- **API Routes**:
  - `/api/payment/create-order`: Creates Razorpay order
  - `/api/payment/verify`: Verifies payment signature

### Integration Points

Payment buttons are integrated in:
- ✅ Request Form (`/request`)
- ✅ Fuel Delivery (`/petrol`)
- ✅ Dashboard (`/dashboard`)
- ✅ Request Details (`/request/[id]`)

## Testing

### Test Cards (Test Mode)

Use these cards in Razorpay test mode:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs

- `success@razorpay`
- `failure@razorpay`

## Production Checklist

Before going live:

- [ ] Switch to **Live API Keys** in Razorpay Dashboard
- [ ] Update environment variables with live keys
- [ ] Test payment flow end-to-end
- [ ] Set up webhook for payment notifications (optional)
- [ ] Configure payment success/failure redirect URLs
- [ ] Enable email notifications in Razorpay Dashboard

## Webhook Setup (Optional)

For real-time payment notifications:

1. Go to Razorpay Dashboard > **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Create webhook handler in `/app/api/payment/webhook/route.ts`

## Troubleshooting

### Payment Button Not Showing

- Check if Razorpay script loaded: Open browser console
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Check network tab for script loading errors

### Payment Fails

- Verify `RAZORPAY_KEY_SECRET` is correct
- Check server logs for signature verification errors
- Ensure amount is in paise (multiply by 100)

### Order Creation Fails

- Check Razorpay API keys are valid
- Verify request amount is greater than 0
- Check server logs for detailed error messages

## Security Notes

- ✅ Payment signature is verified on server
- ✅ Key secret never exposed to client
- ✅ All payment operations are server-side
- ✅ Database updates only after verification

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
