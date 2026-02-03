# **Built using firebase studio**
# 🌸 Blumie – CareSync

Blumie – CareSync is an **emotional well-being support system** that combines a **mobile application, smart IoT hardware, and cloud services** to help caregivers understand and respond to a person’s emotional state in real time.

The core idea of Blumie is simple:  
👉 *Emotions that are hard to say out loud can still be expressed, sensed, and supported.*

---

## 💭 Why Blumie – CareSync?
Many individuals—especially children, elderly people, or emotionally vulnerable users—find it difficult to clearly communicate emotional distress.

Blumie provides:
- A **non-verbal way** to express emotions
- A **physical representation** of mood using a smart flower
- A **caregiver alert system** when emotional distress is detected

---

## 💡 What does the system do?
- User selects or describes their mood in a mobile app
- Each mood is mapped to a **color**
- A flower-shaped smart device glows in that color
- Sensor data and synced health data help validate emotional state
- If distress is detected, a **caregiver is alerted automatically**

---

## 🧠 Technologies Used

### 💻 Software
- Mobile App (Android / Flutter / React Native)
- Firebase (Authentication, Firestore, Alerts)
- Python / JavaScript (Backend logic)
- Basic ML logic for mood verification
- API sync (Google Fit / NoiseFit – simulated)

### 🔌 Hardware
- **ESP32 Microcontroller**
- **RGB LED (WS2812 / NeoPixel)** for mood visualization
- Temperature Sensor
- Heartbeat / Pulse Sensor (real or simulated)
- Microphone Module (voice input)
- Touch / Interaction Sensors
- Power Supply
- 3D-printed **flower-shaped enclosure**

---

## 📁 Project Structure (Side-by-Side Format)

```md
blumie-caresync/

mobile_app/        → User mood input & UI  
firmware/          → ESP32 code for sensors & LEDs  
backend/           → Firebase logic & alert handling  
dashboard/         → Caregiver monitoring interface  
hardware_design/   → Circuit & enclosure design  
README.md          → Project documentation  
⚙️ How Blumie Works
User expresses mood using the mobile app

App converts mood into a color

ESP32 updates the RGB LED inside the Blumie flower

Sensor data + synced app data are analyzed

If 2 out of 3 sources indicate distress:

Caregiver receives an alert

Emotional context is shared via dashboard

⭐ Key Features
Emotional expression without speaking

Real-time physical mood representation

Smart caregiver alert system

Combines IoT, software, and psychology

Human-centric and empathetic design

🔮 Future Enhancements
Real biometric smartwatch integration

AI-based voice emotion detection

Emergency response automation

Smart home integration

Long-term emotional analytics

🎓 Academic Purpose
Blumie – CareSync was developed as part of an engineering semester / hackathon project, focusing on:

Emotional well-being systems

IoT and embedded systems

Human-centered design

Real-world problem solving

👤 Author
Shreesha Kumar
Engineering Student
GitHub: https://github.com/shreesha509

📜 Note
This project is built for educational and research purposes.
Feel free to fork, improve, or extend it.

yaml
Copy code

---

## ✅ After adding README
Run:
```bash
git add README.md
git commit -m "Add README for Blumie CareSync"
git push
