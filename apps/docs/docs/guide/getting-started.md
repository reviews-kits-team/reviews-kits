# Get Started

Reviewskits is designed to be versatile. Whether you want to contribute to the core or deploy your own instance, this guide will help you get started quickly.

---

## 👨‍💻 For Developers (Contributing)

If you want to run Reviewskits locally to build features or fix bugs, follow these steps.

### Prerequisites
- [Bun](https://bun.sh/) (Version >= 1.0)
- [Docker](https://www.docker.com/) (to run database and cache)

### Local Environment Setup

1. **Clone and Install**:
```bash
git clone https://github.com/reviews-kits-team/reviews-kits.git
cd reviews-kits
bun install
```

2. **Environment**:
```bash
cp .env.example .env
# Open .env and set your ADMIN_EMAIL and ADMIN_PASSWORD
```

3. **Infrastucture**:
```bash
# Start Postgres, Redis, and Minio
docker compose -f infra/docker-compose.dev.yml up -d
```

4. **Run**:
```bash
bun run dev
```

Visit `http://localhost:3000/admin` to access the dashboard.

---

## 🐳 Self-hosting (Production)

Reviewskits is fully containerized and easy to deploy on any server.

### Quick Deploy
The fastest way to deploy is using **Docker Compose** or a PaaS like **Coolify**.

- **DNS**: Point your domain (A Record) to your server IP.
- **Config**: Prepare your `.env` with a secure password and auth secret.
- **Database**: Schemas are automatically initialized on startup.

Ready to go live? Follow our detailed guide:

👉 [**Go to Deployment Guide**](/guide/deployment)

---

## 🔐 Next Steps

Once your instance is running, you can:
- [Create your first collection form](/guide/forms)
- [Moderate your first reviews](/guide/moderation)
- [Integrate our SDKs](/sdk/react)
