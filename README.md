# 🚀 DevHub - Student & Resource Management System

DevHub is a professional full-stack ecosystem designed to bridge the gap between instructors and students. It provides a high-performance admin dashboard for managing educational assets and tracking student progress in real-time.

## ✨ Key Features

### 🏛️ Admin Management
- **Unified Dashboard:** Real-time metrics for student enrollment, pending tasks, and resource allocation.
- **Resource Asset Library:** Advanced management for Videos (with YouTube preview integration), PDFs, and external links.
- **Activity Tracking:** Automated feed showing recent student submissions and status changes.
- **Dynamic Profile:** Personalized admin experience with backend-driven identity and roles.

### 🎓 Student Experience
- **Progress Tracking:** Personal dashboard to monitor attendance and task completion.
- **Resource Access:** Filterable library to access learning materials instantly.
- **Social Integration:** Support for coding handles including GitHub, LeetCode, and LinkedIn.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database:** MongoDB via Mongoose.
- **Authentication:** JWT with HttpOnly Cookies for secure sessions.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/devhub.git](https://github.com/your-username/devhub.git)
cd devhub

### 2. 2. Backend Configuration
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat <<EOF > .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
NODE_ENV=development
EOF

# Start development server
npm run dev

### 3.3. Frontend Configuration
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Next.js app
npm run dev
