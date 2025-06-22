# 📖 LifeBook – Personal AI Biographer

**LifeBook** is a full-stack journaling platform that helps users record daily thoughts, reflections, and milestones — and automatically converts them into a beautifully structured life story using AI.

## 🚀 Features

- ✍️ **Notion-style journal editor** for clean and distraction-free writing
- 📅 **Interactive timeline view** with milestone cards grouped by months/years
- 🧠 **AI-generated summaries** for each month and year using OpenAI
- 😊 **Sentiment tracker** visualized through graphs and emojis
- ☁️ **Word cloud visualization** of most frequently used words
- 🔍 Search, filter, and revisit entries with ease
- 📤 Export life stories as a structured PDF

---

## 🧱 Tech Stack

| Layer         | Technology                      |
|--------------|----------------------------------|
| Frontend     | Next.js, Tailwind CSS, Chart.js |
| Backend      | Next.js API Routes, Prisma      |
| Database     | PostgreSQL                      |
| AI Services  | OpenAI API (GPT-4)              |
| Auth         | NextAuth (or JWT)               |
| Deployment   | Vercel (frontend), Render/Railway (backend) |

---

## ⚙️ Project Structure

lifebook/
├── app/ # Next.js 13 App Router
├── components/ # Reusable UI components
├── lib/ # Prisma, OpenAI utilities
├── pages/api/ # API routes (journals, summaries)
├── prisma/ # Prisma schema and migrations
├── public/ # Static assets
├── styles/ # Tailwind/global styles
└── utils/ # Helper functions

yaml
Copy
Edit

---

## 🧠 AI Features

- **Summarization**: Automatically generate monthly/yearly summaries from journal entries.
- **Sentiment Analysis**: Detect the tone of each entry and display mood charts.
- **Prompt Generator**: Suggest reflection prompts when writers are stuck.

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lifebook-ai.git
cd lifebook-ai
2. Install Dependencies
bash
Copy
Edit
npm install
3. Set up .env file
env
Copy
Edit
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
4. Run Prisma
bash
Copy
Edit
npx prisma generate
npx prisma migrate dev --name init
5. Start Development Server
bash
Copy
Edit
npm run dev
