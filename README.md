# 🎭 Teatro de Aventura - Frontend

**Teatro de Aventura** is an interactive theater platform that redefines audience participation. This is the frontend application, built with **React**, **Next.js**, **Tailwind CSS**, and **TypeScript**, providing immersive experiences for administrators, producers, directors, and spectators.

## 🚀 Features

- 🎭 Role-based dashboards (Administrator, Producer, Director, Spectator)
- 🔒 Authentication with role and permission support
- 🧹 Dynamic user and role management
- 🎫 QR-based access for spectators
- 📊 Real-time interaction and audience voting
- 📈 Statistics, reports, and PDF generation
- 🌐 Responsive and accessible UI with Tailwind

## 🚠 Tech Stack

- **React** with **Next.js**
- **TypeScript** for type safety
- **Tailwind CSS** and `tailwind-merge` for styling
- **shadcn/ui** for reusable UI components
- **Axios** for API calls
- **Zustand / React Context** for state management
- **React Hot Toast** for notifications

## 🧱 Project Structure

```bash
.
├── components/           # Reusable UI and form components
├── contexts/             # Authentication context and providers
├── lib/                  # API calls, types, constants
├── app/                  # Next.js routing structure
├── utils/                # Helpers and utilities (e.g. error handling, role helpers)
└── public/               # Static assets
```

## 📦 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/teatro-aventura.git
cd teatro-aventura/frontend
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Configure environment variables**

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8008/api
```

4. **Run the development server**

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 👤 User Roles

| Role          | Emoji | Access                            |
| ------------- | ----- | --------------------------------- |
| Administrator | 👑    | Full system control               |
| Producer      | 🎭    | Manage plays and functions        |
| Director      | 🎮    | Conduct live shows with questions |
| Spectator     | 👤    | Participate by scanning a QR code |

## 📄 License

This project is licensed under the MIT License.

---

Built with 💜 by the ARMAGE team.
