# 🤖 AI-Powered Smart Prescription Assistant

_https://ai-powered-prescription.vercel.app/_
dummy_id : amanjain123@gmail.com
dummy_pass : 111111
https://cloud.mongodb.com/ > Project >> prescription_assistant

> **From Prescription to Recovery — Your AI Healthcare Companion.**

An AI-powered healthcare platform that transforms handwritten prescriptions into structured, easy-to-understand medical information. The application helps patients understand their medicines, discover affordable generic alternatives, receive personalized health guidance, manage long-term treatments, and stay on track with smart medication reminders.

---

# 📖 Overview

Understanding a doctor's handwritten prescription can be challenging for many patients. Missing dosage instructions, forgetting refill dates, or being unaware of affordable generic medicines often leads to poor medication adherence and increased healthcare costs.

The **AI-Powered Smart Prescription Assistant** combines **Multimodal AI**, **Computer Vision**, and **Healthcare Intelligence** to simplify the entire patient journey—from prescription analysis to recovery support.

---

# ✨ Core Features

## 🧾 AI Prescription Understanding

* Upload handwritten or printed prescriptions.
* AI extracts doctor details, patient details, medicines, dosage, frequency, duration, and instructions.
* Converts complex prescriptions into structured digital information.

---

## 💊 Medicine Intelligence

* Explains every medicine in simple language.
* Displays generic name, composition, purpose, dosage, precautions, and side effects.
* Supports multilingual patient-friendly explanations.

---

## ❤️ Chronic Care Management

* Register as a **Regular Medicine User**.
* Daily medicine reminders.
* Smart refill reminders.
* Medicine adherence tracking.
* Prescription history management.

---

## 💰 Smart Cost Saver

* Compare **Branded vs Generic Medicines**.
* Discover affordable alternatives.
* Estimate total treatment cost.
* Calculate potential savings.

---

## 🛒 Smart Medicine Store

* Browse medicines.
* Search & filter.
* Shopping cart.
* Wishlist.
* Dummy checkout.
* Order history.
* Invoice generation.

---

## 📍 Nearby Pharmacy Finder

* Locate nearby pharmacies using **OpenStreetMap**.
* Search nearby generic medicine stores.
* Smart pharmacy recommendations.
* Estimated medicine availability (simulation).

---

## 🥗 AI Food Recognition

* Upload food images.
* AI identifies the food.
* Checks compatibility with predicted disease.
* Detects possible food–medicine interactions.
* Suggests healthier alternatives.

---

## 🤖 AI Health Assistant

* Ask questions about medicines.
* Understand prescriptions.
* Get personalized diet plans.
* Receive lifestyle recommendations.
* Learn recovery tips through conversational AI.

---

## 🌐 Multilingual Support

Healthcare guidance available in:

* English
* Hindi
* Telugu
* Tamil

---

# 🚀 Key Highlights

* ✅ AI-powered handwritten prescription analysis
* ✅ Chronic patient management
* ✅ Smart medicine reminders
* ✅ Disease prediction
* ✅ Personalized diet recommendations
* ✅ Generic medicine comparison
* ✅ Medical cost estimation
* ✅ AI food recognition
* ✅ Nearby pharmacy finder
* ✅ Interactive medicine shopping experience
* ✅ Multilingual healthcare assistance

---

# 🏗️ Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* React Router DOM
* React Hook Form
* Axios
* React Toastify
* React Leaflet

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt
* Multer

## Artificial Intelligence

* Google Gemini 2.5 Flash (Multimodal Vision)

## Cloud & Infrastructure

* Cloudinary
* OpenStreetMap
* Overpass API
* Nominatim API
* n8n (Workflow Automation)

---

# 🏛️ System Architecture

```text
                User
                  │
                  ▼
          React + Vite Frontend
                  │
                  ▼
        Express.js REST API
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
 Gemini AI   MongoDB Atlas  Cloudinary
     │            │            │
     └────────────┼────────────┘
                  ▼
       AI Healthcare Services
```

---

# 🔄 Application Workflow

```text
User Registration
        │
        ▼
Upload Prescription
        │
        ▼
Gemini Vision Analysis
        │
        ▼
Structured Prescription Data
        │
        ▼
Medicine Intelligence
        │
        ▼
Disease Prediction
        │
        ▼
Diet Recommendation
        │
        ▼
Generic Medicine Comparison
        │
        ▼
Nearby Pharmacy Finder
        │
        ▼
Medicine Shopping
        │
        ▼
Food Recognition
        │
        ▼
AI Health Assistant
        │
        ▼
Medicine Reminder System
```

---

# 📂 Project Structure

```text
AI-Powered-Prescription-Assistant
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── context
│   ├── services
│   └── assets
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── jobs
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/ai-powered-smart-prescription-assistant.git

cd ai-powered-smart-prescription-assistant
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 📸 Screenshots

> Screenshots will be added after project completion.

* Home Page
* Login
* Dashboard
* Prescription Upload
* AI Analysis
* Medicine Table
* Disease Prediction
* Diet Recommendation
* Pharmacy Finder
* Shopping Store
* Food Recognition
* AI Health Assistant

---

# 🔮 Future Scope

* WhatsApp reminders
* SMS notifications
* Doctor dashboard
* Pharmacist portal
* Electronic Health Record (EHR) integration
* Wearable device integration
* Voice-based healthcare assistant
* Real-time pharmacy inventory
* Telemedicine support

---

# 🤝 Contributing

Contributions are welcome!

If you have ideas for improving the project:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⚠️ Disclaimer

This application is intended for **educational and informational purposes only**.

AI-generated outputs—including prescription interpretation, disease prediction, medicine explanations, diet recommendations, and food analysis—are **not a substitute for professional medical advice, diagnosis, or treatment**.

Always consult a qualified healthcare professional before making medical decisions.

---

# 👨‍💻 Developed By

**Manish Pratap Singh**
**Prerna Rajput**

> **"Because understanding your prescription shouldn't require a medical degree."**
