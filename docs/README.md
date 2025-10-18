# Documentation

This directory contains all project documentation organized by category.

## 📋 Quick Links

### Getting Started

- **[../CLAUDE.md](../CLAUDE.md)** - Claude Code guidance for developers (architecture, commands, patterns)
- **[../README.md](../README.md)** - Project overview and quick start

### Deployment & Operations

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Database migration and deployment strategy
- **[development/MIGRATION_CHECKLIST.md](development/MIGRATION_CHECKLIST.md)** - Pre-deployment checklist for Supabase

### Development Planning

- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Website optimization roadmap and recommended features
- **[development/I18N_MIGRATION_PLAN.md](development/I18N_MIGRATION_PLAN.md)** - i18n system migration reference

### Database

- **[../supabase/README.md](../supabase/README.md)** - Supabase setup, migrations, and type generation

---

## 📁 Directory Structure

```
docs/
├── README.md                          # This file
├── DEPLOYMENT.md                      # Deployment & migration strategy
├── NEXT_STEPS.md                      # Website optimization roadmap
└── development/
    ├── MIGRATION_CHECKLIST.md         # Pre-deployment checklist
    └── I18N_MIGRATION_PLAN.md         # i18n migration reference
```

---

## 🎯 By Topic

### Development & Architecture

- **Claude Code setup** → [../CLAUDE.md](../CLAUDE.md)
- **Internationalization (i18n)** → [development/I18N_MIGRATION_PLAN.md](development/I18N_MIGRATION_PLAN.md)
- **Database schema & types** → [../supabase/README.md](../supabase/README.md)

### Operations & Deployment

- **Database migrations** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Pre-deployment checklist** → [development/MIGRATION_CHECKLIST.md](development/MIGRATION_CHECKLIST.md)
- **Production deployment** → [DEPLOYMENT.md](DEPLOYMENT.md)

### Planning & Roadmap

- **Feature roadmap** → [NEXT_STEPS.md](NEXT_STEPS.md)
- **Performance improvements** → [NEXT_STEPS.md](NEXT_STEPS.md)
- **SEO optimization** → [NEXT_STEPS.md](NEXT_STEPS.md)

---

## 🚀 Quick Start

### New to the project?

1. Read **[../README.md](../README.md)** for project overview
2. Read **[../CLAUDE.md](../CLAUDE.md)** for development guidelines
3. Check **[../supabase/README.md](../supabase/README.md)** to set up the database locally

### Setting up local development

```bash
# Install dependencies
yarn install

# Start local database
yarn db:start

# Start dev server
yarn dev
```

### Deploying changes

1. Check **[DEPLOYMENT.md](DEPLOYMENT.md)** for migration strategy
2. Review **[development/MIGRATION_CHECKLIST.md](development/MIGRATION_CHECKLIST.md)** before merge
3. Run `yarn build && yarn db:push` to deploy

---

## 📖 Key Documents

### [DEPLOYMENT.md](DEPLOYMENT.md)

Complete guide for deploying database migrations to production, including:

- One-time setup for production
- Developer workflow for adding features
- Automated vs. manual deployment options
- Verification and rollback strategies

### [NEXT_STEPS.md](NEXT_STEPS.md)

Website optimization roadmap including:

- High priority improvements (SEO, images, schemas)
- Medium priority features (BreadcrumbList, reading time)
- Low priority enhancements (RSS links, related posts)
- Content strategy and maintenance checklist

### [../supabase/README.md](../supabase/README.md)

Supabase database documentation:

- Local development setup
- Migration creation and testing
- Type generation from database schema
- Environment configuration
- Troubleshooting guide

### [development/MIGRATION_CHECKLIST.md](development/MIGRATION_CHECKLIST.md)

Pre-deployment verification checklist:

- Pre-merge verification steps
- Post-merge production setup
- Testing and verification steps
- Rollback procedures

### [../CLAUDE.md](../CLAUDE.md)

Developer guidance for Claude Code (external reference):

- Project architecture overview
- Development commands and scripts
- Git workflow and commit guidelines
- Code patterns and best practices

---

## 🔍 Finding What You Need

| I want to...                   | Go to...                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| Understand the project         | [../README.md](../README.md)                                             |
| Develop locally                | [../CLAUDE.md](../CLAUDE.md)                                             |
| Set up database                | [../supabase/README.md](../supabase/README.md)                           |
| Deploy to production           | [DEPLOYMENT.md](DEPLOYMENT.md)                                           |
| Review checklist before deploy | [development/MIGRATION_CHECKLIST.md](development/MIGRATION_CHECKLIST.md) |
| See feature roadmap            | [NEXT_STEPS.md](NEXT_STEPS.md)                                           |
| Learn about i18n system        | [development/I18N_MIGRATION_PLAN.md](development/I18N_MIGRATION_PLAN.md) |

---

## 📝 Documentation Maintenance

When updating documentation:

1. Keep docs in the `/docs` directory
2. Update this README if adding new documents
3. Use relative links for internal references
4. Keep formatting consistent with existing docs
5. Update timestamps when making significant changes

---

**Last updated**: 2025-10-16
