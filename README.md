# Solaura

Solaura is a multi-platform application featuring an augmented reality (AR) iOS mobile experience, a Python-based audio and state-processing backend, and a modern Next.js web interface. 

## 🏗 Architecture & Features

### 📱 Mobile (iOS / AR)
The mobile application is built with Swift and SwiftUI. It leverages ARKit and CoreML for real-time spatial computing and object detection.
- **Object Detection:** Integrates a CoreML YOLOv8 model (`BottleDetector.swift`) for real-time on-device inference.
- **AI Integration:** Seamlessly connects with Gemini (`GeminiService.swift`) and ElevenLabs (`ElevenLabsService.swift`) for advanced conversational AI and voice capabilities.
- **Networking:** Streams state and spatial data to the backend via UDP (`UdpSender.swift`).

### ⚙️ Backend (Python)
A lightweight Python backend designed to handle audio processing, state management, and real-time communication.
- **Real-time Processing:** Listens for incoming UDP packets from the mobile client (`receiver.py`).
- **Audio Capabilities:** Manages audio filtering, spatial audio testing, recording, and playback (`audio_m1p5.py`, `filter.py`, `record.py`).
- **State Management:** Tracks global application states and coordinates data streams (`state.py`).

### 🌐 Frontend (Web)
A responsive web interface built with React, Next.js, and Tailwind CSS.
- **Dashboards & Views:** Includes multiple interactive routes such as `/dashboard`, `/demo`, `/problem`, `/proof`, and `/solution`.
- **Modern Stack:** Utilizes TypeScript, ESLint, and PostCSS for a highly maintainable UI.

## 🚀 Getting Started

### Prerequisites
- **Mobile:** Xcode, iOS device (physical device recommended for ARKit features).
- **Backend:** Python 3.10+
- **Frontend:** Node.js, npm or yarn.

### Installation & Running

#### 1. Frontend Web App
Navigate to the `frontend/` directory, install the Node dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The web app will be available at `http://localhost:3000`.

#### 2. Python Backend
Navigate to the `backend/` directory. Ensure you have the necessary libraries installed (like `ultralytics` for YOLO, and relevant audio processing libraries), then start the receiver:
```bash
cd backend
python audio_m1p5.py
```

#### 3. iOS Mobile App
1. Open `mobile/Solaura/Solaura.xcodeproj` in Xcode.
2. Ensure you have set up your development team in the "Signing & Capabilities" tab.
3. Build and run the project on your connected iOS device.
4. *Note: Ensure your device is on the same local network as the backend server so `UdpSender` can successfully transmit packets.*
