# Silje_Reppe_DVP_MAR25FT

Pressly is a responsive news platform built as a frontend application using vanilla HTML, CSS and JavaScript with Supabase for authentication and article storage.

Live site
https://missadelliah.github.io/Silje_Reppe_DVP_MAR25FT/

Repository
https://github.com/MissAdelliah/Silje_Reppe_DVP_MAR25FT

Technology stack
- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- Vite
- Supabase JavaScript client
- Supabase Authentication
- Supabase Database
- GitHub Pages
- GitHub Actions
  
Features
Pressly supports public article browsing and authenticated article submission.
Users can:
- Browse the latest articles without logging in
- Open individual article pages
- Search articles
- Filter articles by category and tag
- Register with email and password
- Confirm their email through Supabase
- Log in and log out
- Access authenticated navigation options
- Save article topics while logged in
- Create and publish new articles while logged in
- View breaking news and latest news sections
- Use the site across desktop, tablet and mobile layouts
  
The Create Article page is protected. Users who are not authenticated are redirected to the login page before they can publish an article.
Supabase
Supabase is used for authentication and database storage.
Authentication
Registration uses email and password authentication with email confirmation enabled.
The user's display name is stored in Supabase Auth metadata as:
display_name
Articles
Articles are stored in the articles table.

The application uses the following article data:
id
title
body
category
image_url
tags
submitted_by
created_at
updated_at
submitted_by stores the authenticated user's ID.
Row Level Security
Row Level Security is enabled for the articles table.
The project uses policies that allow:
- Public users to read articles
- Authenticated users to create articles
- Article inserts only when submitted_by matches auth.uid()
Img from unsplash

Project structure
.
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── src/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── guards/
│       │   └── requireAuth.js
│       │
│       ├── pages/
│       │   ├── article.js
│       │   ├── create.js
│       │   ├── home.js
│       │   └── login.js
│       │
│       ├── services/
│       │   ├── articles.js
│       │   └── auth.js
│       │
│       ├── ui/
│       │   ├── articles.js
│       │   ├── feedback.js
│       │   ├── mobileMenu.js
│       │   ├── navigation.js
│       │   └── searchMenu.js
│       │
│       ├── utils/
│       │   └── validation.js
│       │
│       └── supabase.js
│
├── article.html
├── create.html
├── index.html
├── login.html
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── vite.config.js

Local development
Install dependencies:
npm install
Create a local .env file based on .env.example:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
Start the development server:
npm run dev

Build the project:
npm run build
Deployment
The project is deployed to GitHub Pages through GitHub Actions.
The deployment workflow:
1. Installs dependencies
2. Builds the Vite project
3. Supplies the Supabase public environment variables from GitHub repository secrets
4. Uploads the generated dist folder
5. Deploys the result to GitHub Pages

The main user flows tested during development include:
- Public article browsing
- Article search and filtering
- Registration
- Email confirmation
- Login
- Logout
- Authenticated navigation
- Protected Create Article route
- Article publishing
- Single article view
- GitHub Pages navigation paths
- Desktop and mobile navigation
- Responsive layouts
  
Notes
The application is intentionally kept within the assignment scope. 

AI
- GitHub Pages paths and deployment
AI was used to help debug routing and path problems that appeared after deployment to GitHub Pages.
- Supabase learning and setup
AI was used for guidance while learning how Supabase works with a frontend application and find my way through supabase when Moodle content is heavy.
AI help me structure/wording the README
AI to create fictional articles

The final application was tested through the browser during development, including both local development and the deployed GitHub Pages version.
