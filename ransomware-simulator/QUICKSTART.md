# 🚀 Quick Start Guide - Hackathon Edition

Get your ransomware simulator running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```powershell
# Navigate to project directory
cd C:\Users\Help\CascadeProjects\ransomware-simulator

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Configure Environment (1 minute)

```powershell
# Copy the example environment file
copy .env.example .env
```

**Note**: The app works out of the box with mock data! No AD/SIEM configuration needed for demo.

## Step 3: Start the Application (1 minute)

```powershell
# Start both backend and frontend
npm run dev
```

Wait for both servers to start:
- ✅ Backend: `Server running on port 5000`
- ✅ Frontend: `Local: http://localhost:5173`

## Step 4: Access the Dashboard (1 minute)

1. Open browser: http://localhost:5173
2. Login with demo credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## 🎯 Demo Walkthrough

### View the Dashboard
- See 5 mock hosts from different departments
- View statistics and charts
- Check system status

### Explore Hosts
1. Click **"Hosts"** in sidebar
2. See all discovered hosts (Finance, HR, IT, Sales, Servers)
3. Filter by department
4. Search for specific hosts

### Browse Malware Library
1. Click **"Malware Library"** in sidebar
2. View 6 different ransomware types:
   - WannaCry Simulator
   - Ryuk Simulator
   - LockBit Simulator
   - Conti Simulator
   - REvil Simulator
   - Basic Crypto Locker
3. Click any malware to see details, MITRE ATT&CK techniques, and prevention tips

### Create Your First Simulation
1. Click **"Simulations"** in sidebar
2. Click **"New Simulation"** button
3. **Step 1**: Select target hosts (try selecting 2-3 hosts)
4. **Step 2**: Choose malware type (try "WannaCry Simulator")
5. **Step 3**: Configure settings:
   - ✅ Keep "Dry Run Mode" enabled (safe!)
   - ✅ Keep "Auto-Revert" enabled
   - Set duration: 300 seconds
   - Choose intensity: Medium
6. Click **"Create Simulation"**

### Run the Simulation
1. Find your new simulation in the list
2. Click **"Start"** button
3. Watch the progress bar fill up
4. See real-time events and affected hosts
5. Simulation will auto-complete and revert

### Monitor Results
- View simulation status (running → completed)
- Check affected hosts
- Review execution logs
- See SIEM events (if configured)

## 🎨 Key Features to Showcase

### 1. **Modern UI**
- Professional dark sidebar
- Real-time charts and graphs
- Responsive design
- Smooth animations

### 2. **Active Directory Integration**
- Automatic host discovery
- Department organization
- Real-time status monitoring
- Falls back to mock data gracefully

### 3. **SIEM Integration**
- Supports Splunk, ELK, QRadar
- Real-time event logging
- Event correlation
- Works without SIEM (local logging)

### 4. **Safety First**
- Dry run mode by default
- Auto-revert capability
- Emergency stop button
- Comprehensive logging

### 5. **Educational Value**
- MITRE ATT&CK mapping
- Detection rules
- Prevention tips
- Behavior analysis

## 🎤 Hackathon Presentation Tips

### Opening (1 minute)
> "We built an enterprise ransomware simulation platform that helps organizations test their defenses, train their teams, and prepare for real attacks - all in a safe, controlled environment."

### Demo Flow (3-4 minutes)

1. **Show Dashboard** (30 seconds)
   - "Here's our main dashboard showing all hosts discovered from Active Directory"
   - Point out real-time statistics and charts

2. **Show Malware Library** (1 minute)
   - "We've integrated 6 different ransomware types from GitHub"
   - Click on one to show MITRE ATT&CK techniques
   - "Each includes detection rules and prevention tips"

3. **Create Simulation** (1.5 minutes)
   - "Creating a simulation is a simple 3-step process"
   - Walk through the wizard
   - "Notice the safety features - dry run mode and auto-revert"

4. **Run Simulation** (1 minute)
   - Start the simulation
   - "Watch as it executes in real-time"
   - "All events are logged to our SIEM"
   - Show the progress and events

### Key Points to Emphasize

✅ **Enterprise Integration**
- "Integrates with Active Directory for automatic host discovery"
- "Sends all events to SIEM platforms like Splunk or ELK"

✅ **Safety & Control**
- "Every simulation runs in dry-run mode by default"
- "Auto-revert ensures no permanent changes"
- "Emergency stop button for immediate termination"

✅ **Educational Value**
- "Maps to MITRE ATT&CK framework"
- "Helps teams practice incident response"
- "Validates detection and backup procedures"

✅ **Real-World Ready**
- "Built with enterprise-grade tech stack"
- "Comprehensive logging and audit trails"
- "Follows security best practices"

### Closing (30 seconds)
> "This platform helps organizations move from reactive to proactive security - testing their defenses before attackers do, in a safe and controlled way."

## 🔧 Quick Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <PID> /F

# Restart
npm run server
```

### Frontend won't start
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill the process if needed
taskkill /PID <PID> /F

# Restart
cd client
npm run dev
```

### Can't login
- Default credentials: `admin` / `admin123`
- Check browser console for errors
- Verify backend is running

## 📊 Mock Data Overview

The app includes realistic mock data:
- **5 Hosts**: Finance, HR, IT, Sales, Servers
- **6 Malware Types**: Various ransomware simulators
- **Multiple Departments**: Realistic organizational structure
- **Status Indicators**: Online/offline hosts

## 🎯 Advanced Features (If Time Permits)

### Configure Real AD Integration
```env
AD_URL=ldap://your-dc.local:389
AD_BASE_DN=DC=ransomrun,DC=local
AD_USERNAME=admin@ransomrun.local
AD_PASSWORD=YourPassword
```

### Configure SIEM Integration
```env
SIEM_TYPE=splunk
SIEM_URL=https://splunk.local:8089
SIEM_API_KEY=your-token
SIEM_INDEX=ransomware_sim
```

### Test Connections
1. Go to **Settings** page
2. Click **"Test Connection"** for AD
3. Click **"Test Connection"** for SIEM

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Setup Guide**: See `SETUP.md`
- **Security Guidelines**: See `SECURITY.md`
- **Project Details**: See `PROJECT_SUMMARY.md`

## 🏆 Winning Points

This project demonstrates:
1. ✅ **Full-stack expertise** - React + Node.js
2. ✅ **Enterprise integration** - AD + SIEM
3. ✅ **Security awareness** - Safe simulation practices
4. ✅ **Modern UI/UX** - TailwindCSS + responsive design
5. ✅ **Real-world applicability** - Actual business value
6. ✅ **Comprehensive documentation** - Production-ready
7. ✅ **Scalability** - Modular architecture
8. ✅ **Best practices** - Security, logging, error handling

## 🎉 You're Ready!

Your ransomware simulator is now running and ready to demo. Good luck with your hackathon! 🚀

---

**Need Help?** Check the logs:
- Backend logs: Console where you ran `npm run dev`
- Frontend logs: Browser Developer Console (F12)
- Application logs: `logs/` directory
