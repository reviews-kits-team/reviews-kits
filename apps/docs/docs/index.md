# Overview

**Reviewskits** is an open-source, self-hosted, and headless testimonial engine. It is designed for developers and companies who want to collect customer social proof without giving up control over their data or being forced into pre-built, unstyled widgets.

## Why Reviewskits?

Most testimonial platforms follow a "SaaS-only" model: they own your data, charge monthly fees, and force you to use their iframes or scripts. **Reviewskits flips the script.**

- **Own Your Data**: Host it on your own infrastructure (Docker). Your reviews stay in your database.
- **Total UI Freedom**: We provide the data via a clean API or SDKs. You build the "Wall of Love" exactly as you want it.
- **API-First**: Built for the modern web. Every feature is accessible via REST endpoints.
- **Zero Lock-in**: No proprietary widgets. If you want to move, your data is yours to take.

---

## How it Works

Reviewskits streamlines the entire testimonial lifecycle into three simple stages:

### 1. Collect
Create beautiful, branded public forms in seconds. Share the link with your customers or embed the collection flow directly in your app.

### 2. Moderate
Reviews arrive in your private **Admin Dashboard**. Approve the best ones, reject the spam, and manage your collection forms from a clean, unified interface.

### 3. Display
This is where Reviewskits shines. Use our official **React** or **Vue** SDKs (or the raw **REST API**) to fetch your approved reviews and render them using your own components, animations, and styles.

---

## Core Features

- **🛡️ Secure by Design**: Powered by **Better-Auth** for robust administrative security.
- **🚀 High Performance**: Built with **Hono** and **Bun** for extreme speed and edge-compatibility.
- **📦 Multi-Framework**: First-class, zero-dependency SDKs for Vue, Nuxt, React, and Next.js.
- **🔌 Extensible**: Outgoing **Webhooks** support (coming soon) to trigger actions in Slack, Discord, or Zapier when a new review arrives.
- **🔑 Granular Access**: Manage **API Keys** (Public vs. Secret) to keep your backend safe while serving the frontend.

---

## Tech Stack

Reviewskits is built with a modern, type-safe stack:

| Component | Technology |
|---|---|
| **API Backend** | Hono + Bun |
| **Database** | PostgreSQL + Drizzle ORM |
| **Authentication** | Better-Auth |
| **Admin UI** | React + Tailwind + Shadcn/UI |
| **Documentation** | VitePress |

---

## Ready to Start?

Jump into the **Get Started** guide to get Reviewskits running on your machine in less than 5 minutes.
