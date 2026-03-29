<p align="center">
  <a href="https://github.com/reviews-kits-team/reviews-kits">
    <img src="apps/docs/docs/public/logo.svg" alt="Reviewskits Logo" width="120" height="120">
  </a>
</p>

<h1 align="center">Reviewskits</h1>

<p align="center">
  <strong>The Open Source, Self-Hosted Alternative to Senja.</strong><br />
  Collect, moderate, and display customer reviews with a professional headless API.
</p>

<p align="center">
  <a href="https://docs.reviewskits.com"><strong>Documentation</strong></a> ·
  <a href="https://reviewskits.com"><strong>Website</strong></a> ·
  <a href="https://github.com/reviews-kits-team/reviews-kits/issues"><strong>Report Bug</strong></a> ·
  <a href="https://github.com/reviews-kits-team/reviews-kits/stargazers"><strong>Star us on GitHub</strong></a>
</p>

<p align="center">
  <a href="https://github.com/reviews-kits-team/reviews-kits/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License">
  </a>
  <a href="https://github.com/reviews-kits-team/reviews-kits/stargazers">
    <img src="https://img.shields.io/github/stars/reviews-kits-team/reviews-kits?style=social" alt="GitHub stars">
  </a>
  <a href="https://twitter.com/reviewskits">
    <img src="https://img.shields.io/twitter/follow/reviewskits?style=social" alt="Twitter follow">
  </a>
</p>

---

## ✨ About Reviewskits

Reviewskits provides a free and open-source testimonial engine. Gather social proof at every point in the user journey with beautiful collection forms, moderate them from a clean dashboard, and display them anywhere using our headless SDKs.

### 🛡️ Your data belongs to you
Unlike cloud-only platforms, Reviewskits is designed to be self-hosted. Your reviews stay in your own infrastructure, giving you total control over privacy and security.

### 🎨 Zero UI lock-in
We don't force you into unstyled widgets or iframes. We provide the data, and you provide the style. Build your "Wall of Love" exactly how you want it with our official React and Vue SDKs.

---

## 💪 Mission: Empower your project with authentic social proof.

Documentation and social proof shouldn't be a black box. Reviewskits is built for developers who care about performance, privacy, and complete design freedom.

---

## 📋 Table of Contents

- [Features](#-features)
- [Built on Open Source](#-built-on-open-source)
- [Getting Started](#-getting-started)
- [Self-hosting](#-self-hosting-reviewskits)
- [Development](#-development)
- [Contribution](#-contribution)
- [Contact](#-contact-us)
- [Security](#-security)
- [License](#-license)

---

## 🚀 Features

- **📲 Customizable Forms**: Create conversion-optimized collection forms with custom fields and branding.
- **⚖️ Clean Moderation**: Approve or reject reviews in seconds from a unified admin dashboard.
- **📦 Headless SDKs**: First-class support for Vue, Nuxt, React, and Next.js with zero-dependency packages.
- **🔑 API-First**: Every feature is accessible via a secure REST API (Public & Admin keys).
- **🔒 Self-Hostable**: Simple Docker deployment. No external dependencies or mandatory cloud accounts.
- **⚡ Performance**: Powered by Hono and Bun for extreme speed and low resource usage.

---

## 🛠️ Built on Open Source

Reviewskits is built on a modern, type-safe stack:

- **💻 Language**: [TypeScript](https://www.typescriptlang.org/)
- **🚀 Runtime**: [Bun](https://bun.sh/)
- **⚛️ Frontend (Admin)**: [React](https://reactjs.org/) + [TailwindCSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **🔌 Backend API**: [Hono](https://hono.dev/)
- **📚 Database**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **🔒 Authentication**: [Better-Auth](https://better-auth.com/)
- **📖 Docs**: [VitePress](https://vitepress.dev/)

---

## 🏁 Getting started

We've got several options to help you quickly get started with Reviewskits.

### ☁️ Cloud Version (Coming Soon)
We are currently working on a hosted cloud offering for those who want to get started without managing infrastructure. Stay tuned!

### 🐳 Self-hosting Reviewskits
Reviewskits is available Open-Source under the AGPLv3 license. You can host it on your own servers using Docker.

#### Docker Compose (Recommended)
The easiest way to get started is using our Docker Compose setup:

```bash
# 1. Clone the repo
git clone https://github.com/reviews-kits-team/reviews-kits.git
cd reviews-kits

# 2. Configure environment
cp .env.example .env
# → Fill in ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL

# 3. Launch
docker compose -f infra/docker-compose.yml up -d
```

---

## 👨‍💻 Development

### Prerequisites
- [Bun](https://bun.sh/) (Recommended) or Node.js
- [Docker](https://www.docker.com/) (for infrastructure: Postgres, Redis, Minio)

### Local Setup
```bash
# Install dependencies
bun install

# Start development infrastructure
docker compose -f infra/docker-compose.dev.yml up -d

# Run dev server
bun run dev
```

---

## ✍️ Contribution

We are very happy if you are interested in contributing to Reviewskits! 🤗

- **Star this repo**: It helps us grow and reach more developers.
- **Create issues**: If you find a bug or have a feature request, please open an issue.
- **Join the discussion**: Share your ideas on how to improve the platform.

All contributors are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## 📆 Contact us

Let's have a chat about your social proof needs and get you started.

[Book us with Cal.com](https://cal.com/reviewskits)

---

## 🔒 Security

We take security very seriously. If you come across any security vulnerabilities, please disclose them by sending an email to `security@reviewskits.com`. See [SECURITY.md](./SECURITY.md) for more information.

---

## 👩‍⚖️ License

### The AGPL Reviewskits Core
The Reviewskits core application is licensed under the **AGPLv3 Open Source License**. You can use the software for free for personal and commercial use, provided you follow the AGPL terms.

### The Enterprise Edition
Additional functionality designed for larger teams and enterprises is available under a commercial license. See [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md) or the [License page](https://docs.reviewskits.com/guide/license) in our docs.

### White-Labeling
We currently do not offer Reviewskits white-labeled. Any other licensing needs? Send us an email at `hello@reviewskits.com`.

---

<p align="center">
  <a href="#-table-of-contents">🔼 Back to top</a>
</p>