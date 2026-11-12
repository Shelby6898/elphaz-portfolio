# Elphaz Shelby — Developer Portfolio

Production portfolio of **Elphaz Shelby**, a Kenyan software developer and founder of **Taifatech Solutions**.

The portfolio showcases software engineering projects, client work, technical interests, and professional contact information. It also includes a Supabase-powered administration area for managing profile content and a privacy-conscious, opt-in analytics dashboard.

**Live website:** https://elphaz-portfolio.vercel.app
**GitHub repository:** https://github.com/Shelby6898/elphaz-portfolio

## About

I build practical software solutions that address real-world problems. My interests include software engineering, AI-assisted development, business applications, secure system design, and locally deployable technology.

This portfolio presents selected projects, technical experience, and software solutions developed through personal initiatives and client work.

## Featured Projects

### Taifa AI

An offline-first AI coding agent designed to help developers understand, write, test, and manage software locally.

- Technologies: React, Node.js, Ollama, local language models
- Focus: Local AI-assisted software development
- Status: In development
- Repository: https://github.com/Shelby6898/taifa-ai

### Taifa Asset Manager

An asset management platform for organizations that need structured asset tracking and accountability.

- Features: Role-based access control, asset tracking, transfers, maintenance workflows, requests, and audit trails
- Status: Live platform
- Website: https://taifatech.org

### Celestique Beauty Spa

A client website project for a beauty and wellness business.

- Focus: Business website development and digital service presentation
- Status: Client project
- Project details: Featured in the portfolio

### ICT Ticketing System

An IT support and ticket management system focused on organizing service requests and support workflows.

- Technologies: Kotlin, Firebase, Node.js, REST APIs
- Focus: Helpdesk workflows and IT support management
- Status: In development
- Repository: https://github.com/Shelby6898/ict-ticketing-system

### Bungoma Pay

A payment workflow project exploring payment integration and transaction status handling.

- Technologies: Node.js, Express, Firebase, M-Pesa integration
- Status: In development

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, Tailwind CSS |
| Build tooling | Vite |
| Routing | React Router |
| Backend and APIs | Node.js, Express, REST APIs |
| Database and services | Supabase, Firebase |
| Authentication | Supabase Auth |
| Icons | Lucide React |
| Development tools | Git, GitHub, npm |

## Portfolio Features

### Public portfolio

- Responsive portfolio interface
- Professional introduction and profile information
- Featured projects and project links
- Contact and CV links
- Supabase-managed profile information

### Administration

The `/admin` route provides an authenticated administration area.

The profile editor supports management of:

- Full name and professional headline
- Biography
- Profile photograph
- CV document

Profile content is stored through Supabase services. Administrative access is protected by Supabase authentication and the portfolio administrator authorization function.

### Privacy-conscious analytics

The portfolio includes an opt-in analytics system.

Visitors can accept or decline analytics collection and change their choice later. Analytics events are not submitted unless consent has been accepted.

Tracked event types:

- `page_view` — recorded page visits
- `project_view` — project section views
- `cv_click` — CV link clicks
- `contact_click` — contact link clicks
- `outbound_click` — external link clicks

The administrator dashboard provides:

- Unique visitor and session counts
- Page and project views
- CV, contact, and outbound click counts
- Popular pages and projects
- Referrer hostnames
- Coarse device and browser categories
- Daily activity
- Recent recorded events
- 7-day, 30-day, and 90-day reporting periods

#### Analytics privacy and retention

The implementation is designed to minimize collected information:

- Analytics are opt-in.
- Visitor identifiers are first-party random identifiers.
- Visitor identifiers expire after 30 days.
- Session identifiers expire after 30 minutes of inactivity.
- Referrers are stored as hostnames, not complete URLs.
- Device and browser information is stored as broad categories.
- Raw IP addresses, email addresses, full user-agent strings, and geolocation are not collected by the analytics event implementation.
- Raw analytics events are retained for 90 days.
- Administrators can manually delete events older than 90 days from the dashboard.

Analytics represent visitors who consented to tracking, not necessarily every visitor to the website. Dashboard totals are calculated from the loaded event sample, which is limited to 5,000 records.

A CV click does not confirm that a document was downloaded or opened. A contact click does not confirm that a message was sent.

## Local Development

### Requirements

- Node.js version compatible with Vite 8
- npm
- Git

### Clone the repository

```bash
git clone https://github.com/Shelby6898/elphaz-portfolio.git
cd elphaz-portfolio
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholders with the appropriate Supabase project URL and publishable/anon key.

These variables are used by the frontend Supabase client. Never put a Supabase service-role key or other private server credentials in a `VITE_` variable or frontend source code.

The analytics ingestion endpoint is provided by the deployed Supabase Edge Function. Its service-role credentials must remain configured as server-side function secrets, not in the portfolio environment file.

### Start the development server

```bash
npm run dev
```

Vite prints the local development URL in the terminal.

### Build for production

```bash
npm run build
```

The production-ready files are generated in the `dist/` directory.

### Preview the production build locally

```bash
npm run preview
```

### Run lint checks

```bash
npm run lint
```

## Deployment

The production portfolio is hosted on Vercel and connected to the GitHub repository.

Production URL:

https://elphaz-portfolio.vercel.app

The production deployment is configured to use the `main` branch.

Typical deployment workflow:

1. Make and test changes locally.
2. Run `npm run lint` and `npm run build`.
3. Review the changes with `git diff`.
4. Commit the intended files.
5. Push to the `main` branch.
6. Verify the resulting Vercel deployment.

Example:

```bash
git add README.md
git commit -m "Update portfolio documentation"
git push origin main
```

Vercel automatically deploys changes pushed to the connected production branch.

## Security Notes

- Keep `.env.local` out of version control.
- Never commit passwords, service-role keys, private API keys, or other secrets.
- Use Supabase Row Level Security to protect database access.
- Keep administrator authorization checks on the server/database side.
- Do not rely on frontend visibility or CORS alone as an authorization mechanism.
- Keep private credentials in the appropriate server-side environment or Supabase function secrets.

## Contact

- **Email:** elphazshelby@gmail.com
- **GitHub:** https://github.com/Shelby6898
- **Taifatech Solutions:** https://taifatech.org
- **Portfolio:** https://elphaz-portfolio.vercel.app

---

Built by Elphaz Shelby in Kenya.
