# Bravilio

A production-ready multi-tenant SaaS platform for lead sourcing, enrichment, email verification, and outreach automation.

## Features

- **Lead Management** - Import, organize, and manage leads with CRM-lite functionality
- **Data Enrichment** - Enrich leads with company data, job titles, and contact information
- **Email Verification** - Verify emails in real-time or bulk with 99%+ accuracy
- **Outreach Sequences** - Build multi-step email sequences with personalization
- **LinkedIn Tasks** - Manage LinkedIn outreach with manual task tracking
- **Analytics Dashboard** - Track campaign performance and metrics
- **Multi-tenant Workspaces** - Collaborate with team members in isolated workspaces
- **Integrations** - Connect with Apollo, Google Maps, Sheets, and more

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Caching/Jobs**: Redis, BullMQ
- **Authentication**: NextAuth.js with OAuth (Google, Microsoft)
- **Payments**: Stripe (subscriptions + usage credits)
- **Storage**: S3-compatible (AWS S3, Cloudflare R2)
- **Monitoring**: Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/bravilio.git
cd bravilio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the required values (see Environment Variables section)

5. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Using Docker

```bash
docker-compose up -d
```

This starts:
- Next.js app on port 3000
- PostgreSQL on port 5432
- Redis on port 6379
- Bull Board (job monitor) on port 3001

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bravilio?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# S3 Storage
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""

# Encryption
ENCRYPTION_KEY="" # 32-byte hex string

# Integrations
APOLLO_API_KEY=""
GOOGLE_MAPS_API_KEY=""

# Sentry
SENTRY_DSN=""
```

## Project Structure

```
bravilio/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Auth pages (login, signup)
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── (marketing)/   # Marketing/landing pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── marketing/     # Marketing components
│   │   └── ui/            # Base UI components
│   ├── hooks/             # React hooks
│   ├── lib/               # Utilities and configs
│   └── types/             # TypeScript types
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Database Schema

Key models include:
- **User** - User accounts with OAuth support
- **Workspace** - Multi-tenant workspaces
- **Lead** - Contact/person records
- **Company** - Organization records
- **Sequence** - Email sequence definitions
- **Campaign** - Active campaign instances
- **SendingAccount** - Email sending configurations
- **Integration** - Third-party integrations

See `prisma/schema.prisma` for the complete schema.

## API Documentation

The API follows REST conventions with JSON responses.

### Authentication
All API routes (except webhooks) require authentication via session cookie or API key.

### Common Endpoints

```
GET    /api/workspaces                    # List workspaces
POST   /api/workspaces                    # Create workspace
GET    /api/workspaces/:id/leads          # List leads
POST   /api/workspaces/:id/leads          # Create lead
GET    /api/workspaces/:id/sequences      # List sequences
POST   /api/workspaces/:id/sequences      # Create sequence
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Docker
```bash
docker build -t bravilio .
docker run -p 3000:3000 bravilio
```

### Self-hosted
1. Build the application: `npm run build`
2. Run database migrations: `npx prisma migrate deploy`
3. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: [docs.bravilio.com](https://docs.bravilio.com)
- Email: support@bravilio.com
- Discord: [Join our community](https://discord.gg/bravilio)
