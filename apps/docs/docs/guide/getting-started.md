# Getting Started

Get Reviewskits up and running in minutes on your local machine or server.

## Installation

The easiest way to start is using Docker.

```bash
# Clone the repository
git clone https://github.com/reviews-kits-team/reviews-kits.git
cd reviews-kits

# Copy example environment
cp .env.example .env

# Install dependencies (Monorepo)
bun install

# Start the infrastructure
docker compose -f infra/docker-compose.dev.yml up -d

# Initialize the Database Schema (Required)
cd apps/server && bunx drizzle-kit push && cd ../..
```

## Initial Setup

Once the containers are running, you can access the admin dashboard at:
`http://localhost:3000/admin` (Default development URL)

1. **Login**: Use the credentials defined in your `.env`.
2. **Create a Form**: Go to the "Forms" section and create your first collection form.
3. **Collect Reviews**: Share the public form link with your customers.
4. **Moderate**: Approve or reject reviews from your dashboard.

## Next Steps

Now that you have your first reviews, it's time to display them on your website!

- [Install Vue SDK](/sdk/vue)
- [Install React SDK](/sdk/react)
