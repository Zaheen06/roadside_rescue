# Roadside Rescue - 24/7 Emergency Assistance Platform

A comprehensive Next.js application for on-demand roadside assistance services including tire repairs, fuel delivery, and vehicle breakdown support.

## Features

### User Features
- **Service Requests**: Request puncture repair, stepney change, tube replacement
- **Fuel Delivery**: Order petrol/diesel delivery to your location
- **Real-time Tracking**: Track your requests and assigned technicians
- **Dashboard**: View all your requests and their status
- **Payment Integration**: Pay for services securely (Razorpay ready)

### Technician Features
- **Technician Portal**: Dedicated dashboard for technicians
- **Request Management**: Accept, track, and complete service requests
- **Live GPS Tracking**: Automatic location updates every 5 seconds
- **Availability Toggle**: Mark yourself as available/unavailable
- **Request History**: View assigned and completed requests

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet/React-Leaflet
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd roadside-rescue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Gateway (Razorpay) - Optional
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Database Setup

Run the SQL schema file in your Supabase SQL editor:

```bash
# Execute the SQL file: sql/supabase_schema.sql
```

This will create all necessary tables:
- `technicians` - Technician profiles and availability
- `services` - Service catalog
- `vehicles` - User vehicle information
- `requests` - Service requests/bookings
- `fuel_requests` - Fuel delivery details
- `reviews` - Customer reviews

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
roadside-rescue/
├── app/
│   ├── api/              # API routes
│   │   ├── requests/     # User request endpoints
│   │   ├── technicians/  # Technician endpoints
│   │   └── payment/      # Payment processing
│   ├── auth/             # User authentication
│   ├── dashboard/        # User dashboard
│   ├── request/          # Service request pages
│   ├── petrol/           # Fuel delivery page
│   ├── technician/       # Technician portal
│   └── landing/          # Landing page
├── components/           # React components
├── lib/                  # Utility libraries
└── sql/                  # Database schema
```

## Key Pages

- `/` - Redirects to landing page
- `/landing` - Marketing landing page
- `/auth` - User login/signup
- `/dashboard` - User request dashboard
- `/request` - Create service request
- `/petrol` - Fuel delivery request
- `/request/[id]` - Request details and tracking
- `/technician/auth` - Technician login
- `/technician` - Technician dashboard

## API Routes

- `GET /api/requests?user_id=xxx` - Get user requests
- `POST /api/technicians/nearby` - Find nearby technicians
- `GET /api/technicians/requests` - Get available requests
- `POST /api/technician/accept` - Accept a request
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## Database Schema

The application uses the following main tables:

- **technicians**: Stores technician information, location, and availability
- **services**: Service catalog with pricing
- **requests**: Main booking/request table
- **fuel_requests**: Fuel delivery specific details
- **reviews**: Customer feedback

See `sql/supabase_schema.sql` for complete schema.

## Payment Integration

The app includes Razorpay payment gateway integration setup. To enable:

1. Sign up for Razorpay account
2. Add your keys to `.env.local`
3. Install Razorpay SDK: `npm install razorpay`
4. Uncomment payment code in `/app/api/payment/create-order/route.ts`

## Features in Detail

### Real-time Updates
- Request status updates via Supabase real-time subscriptions
- Technician location tracking every 5 seconds
- Live request status changes

### Authentication
- User authentication via Supabase Auth
- Separate technician authentication
- Protected routes with AuthGuard component

### Location Services
- GPS-based location detection
- Interactive maps with Leaflet
- Distance calculation for technician matching

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

The app can be deployed on Vercel, Netlify, or any Node.js hosting platform:

1. Push code to GitHub
2. Connect repository to hosting platform
3. Add environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
