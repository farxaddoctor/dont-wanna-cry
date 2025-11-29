# Ransomware Simulator - Project Summary

## 🎯 Project Overview

A comprehensive enterprise-grade ransomware simulation platform designed for security testing, training, and incident response preparation. Built for your hackathon with full Active Directory and SIEM integration.

## ✨ Key Features

### 1. **Interactive Dashboard**
- Real-time statistics and metrics
- Visual charts showing host distribution and simulation status
- Recent activity monitoring
- System health indicators

### 2. **Active Directory Integration**
- Automatic host discovery from AD
- Real-time synchronization
- Department/OU-based organization
- Host status monitoring (online/offline)
- Support for mock data when AD unavailable

### 3. **SIEM Integration**
- Multi-platform support (Splunk, ELK Stack, QRadar)
- Real-time event logging
- Automated alert generation
- Event correlation and querying
- Graceful fallback to local logging

### 4. **Ransomware Library**
- 6 pre-configured ransomware simulators:
  - WannaCry Simulator
  - Ryuk Simulator
  - LockBit Simulator
  - Conti Simulator
  - REvil/Sodinokibi Simulator
  - Basic Crypto Locker (educational)
- MITRE ATT&CK technique mapping
- Detailed behavior descriptions
- Detection rules and prevention tips
- GitHub integration for samples

### 5. **Simulation Control**
- **3-Step Wizard**:
  1. Select target hosts
  2. Choose malware type
  3. Configure parameters
- **Safety Features**:
  - Dry run mode (default)
  - Auto-revert capability
  - Duration limits
  - Intensity controls
- **Real-time Monitoring**:
  - Progress tracking
  - Live event streaming
  - Step-by-step execution logs
- **Controls**:
  - Start/Stop simulations
  - Emergency kill switch
  - Manual revert option

### 6. **Host Management**
- Grid view of all discovered hosts
- Search and filter capabilities
- Department-based filtering
- Detailed host information
- Status indicators

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Dashboard  - Hosts  - Simulations  - Malware  - Settings│
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   Backend (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   AD     │  │   SIEM   │  │ Malware  │  │Simulation│  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────┬────────────────┬────────────────────────┬─────────┘
         │                │                        │
         ▼                ▼                        ▼
┌─────────────┐  ┌─────────────┐        ┌─────────────┐
│   Active    │  │    SIEM     │        │   Target    │
│  Directory  │  │  Platform   │        │    Hosts    │
└─────────────┘  └─────────────┘        └─────────────┘
```

## 📁 Project Structure

```
ransomware-simulator/
├── server/                      # Backend application
│   ├── index.js                # Express server entry point
│   ├── routes/                 # API route handlers
│   │   ├── hosts.js           # Host management endpoints
│   │   ├── simulations.js     # Simulation control endpoints
│   │   ├── malware.js         # Malware library endpoints
│   │   ├── siem.js            # SIEM integration endpoints
│   │   └── auth.js            # Authentication endpoints
│   ├── services/              # Business logic
│   │   ├── adService.js       # Active Directory integration
│   │   ├── siemService.js     # SIEM integration
│   │   ├── malwareService.js  # Malware management
│   │   └── simulationService.js # Simulation orchestration
│   └── utils/
│       └── logger.js          # Winston logging
│
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Layout.jsx    # Main layout with sidebar
│   │   │   └── CreateSimulationModal.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── Hosts.jsx     # Host management
│   │   │   ├── Simulations.jsx # Simulation control
│   │   │   ├── Malware.jsx   # Malware library
│   │   │   ├── Settings.jsx  # Configuration
│   │   │   └── Login.jsx     # Authentication
│   │   ├── App.jsx           # Root component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example               # Environment template
├── .gitignore
├── package.json              # Backend dependencies
├── README.md                 # Main documentation
├── SETUP.md                  # Setup instructions
├── SECURITY.md               # Security guidelines
└── PROJECT_SUMMARY.md        # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AD Integration**: activedirectory2, ldapjs
- **HTTP Client**: axios
- **Logging**: winston
- **Security**: helmet, express-rate-limit, bcryptjs, jsonwebtoken
- **Utilities**: uuid, node-cron, ws

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: axios

## 🚀 Quick Start

### Installation

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Configuration

```powershell
# Copy environment template
copy .env.example .env

# Edit configuration
notepad .env
```

### Run Development Server

```powershell
# Start both backend and frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Default Login**: admin / admin123

## 📊 API Endpoints

### Hosts
- `GET /api/hosts` - List all hosts
- `GET /api/hosts/:id` - Get host details
- `GET /api/hosts/ou/:ou` - Get hosts by OU
- `GET /api/hosts/test/connection` - Test AD connection

### Simulations
- `GET /api/simulations` - List simulations
- `GET /api/simulations/:id` - Get simulation details
- `POST /api/simulations` - Create simulation
- `POST /api/simulations/:id/start` - Start simulation
- `POST /api/simulations/:id/stop` - Stop simulation
- `POST /api/simulations/:id/revert` - Revert changes
- `DELETE /api/simulations/:id` - Delete simulation

### Malware
- `GET /api/malware` - List malware types
- `GET /api/malware/:id` - Get malware details
- `GET /api/malware/:id/metadata` - Get detailed metadata
- `POST /api/malware/:id/prepare` - Prepare malware

### SIEM
- `POST /api/siem/test` - Test SIEM connection
- `POST /api/siem/events` - Send event
- `GET /api/siem/events` - Query events

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify token

## 🎨 UI Features

### Modern Design
- Clean, professional interface
- Dark sidebar with red accent colors
- Responsive grid layouts
- Smooth transitions and animations
- Card-based components

### User Experience
- Intuitive navigation
- Real-time updates
- Progress indicators
- Status badges
- Interactive charts
- Search and filtering
- Modal dialogs

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Session management
- Token expiration

### API Security
- Rate limiting
- Helmet.js security headers
- CORS configuration
- Input validation

### Simulation Safety
- Dry run mode by default
- Auto-revert capability
- Duration limits
- Emergency stop
- Comprehensive logging

### Data Protection
- Environment variable configuration
- No hardcoded credentials
- Secure SIEM communication
- Audit trail

## 📈 Simulation Workflow

1. **Create Simulation**
   - Select target hosts from AD
   - Choose ransomware type
   - Configure safety parameters

2. **Execute Simulation**
   - System generates execution steps
   - Each step is logged to SIEM
   - Progress tracked in real-time
   - Events streamed to dashboard

3. **Monitor Progress**
   - View live progress bar
   - See step-by-step execution
   - Monitor affected hosts
   - Track SIEM events

4. **Complete/Stop**
   - Auto-revert if enabled
   - Manual stop available
   - Emergency kill switch
   - Cleanup and logging

5. **Review Results**
   - Detailed execution logs
   - SIEM event correlation
   - Impact assessment
   - Lessons learned

## 🎓 Educational Value

### Learning Objectives
- Understand ransomware behavior
- Practice incident response
- Test detection capabilities
- Validate backup procedures
- Train security teams

### MITRE ATT&CK Mapping
All simulations mapped to:
- T1486: Data Encrypted for Impact
- T1490: Inhibit System Recovery
- T1021: Remote Services
- T1083: File and Directory Discovery
- T1135: Network Share Discovery
- And more...

### Detection Training
- Learn to identify ransomware indicators
- Understand attack patterns
- Practice SIEM correlation
- Develop detection rules

## 🔧 Customization

### Adding New Malware Types
Edit `server/services/malwareService.js`:
```javascript
{
  id: 'custom-ransomware',
  name: 'Custom Ransomware',
  type: 'custom',
  description: 'Your description',
  behaviors: ['behavior1', 'behavior2'],
  // ... more configuration
}
```

### Custom SIEM Integration
Extend `server/services/siemService.js`:
```javascript
async sendToCustomSIEM(event) {
  // Your SIEM integration logic
}
```

### UI Customization
- Modify `client/tailwind.config.js` for colors
- Edit `client/src/index.css` for global styles
- Update components in `client/src/components/`

## 📝 Best Practices

### Before Running
1. ✅ Get written authorization
2. ✅ Backup all systems
3. ✅ Isolate test network
4. ✅ Configure monitoring
5. ✅ Test rollback procedures

### During Simulation
1. ✅ Monitor continuously
2. ✅ Stay within scope
3. ✅ Document everything
4. ✅ Maintain communication
5. ✅ Be ready to abort

### After Simulation
1. ✅ Verify restoration
2. ✅ Review logs
3. ✅ Document findings
4. ✅ Update procedures
5. ✅ Debrief team

## 🐛 Troubleshooting

### Common Issues

**AD Connection Failed**
- Check LDAP URL and credentials
- Verify network connectivity
- Ensure firewall allows port 389/636

**SIEM Events Not Appearing**
- Verify SIEM URL and API key
- Check network connectivity
- Review SIEM index configuration

**Frontend Not Loading**
- Check if backend is running
- Verify port 5000 is available
- Check browser console for errors

## 🚀 Deployment

### Development
```powershell
npm run dev
```

### Production
```powershell
cd client && npm run build && cd ..
npm start
```

### With PM2
```powershell
pm2 start server/index.js --name ransomware-simulator
pm2 save
```

## 📄 License

MIT License - Educational and authorized security testing only.

## ⚠️ Legal Disclaimer

This tool is provided for educational and authorized security testing purposes only. Unauthorized use of this tool may violate local, state, federal, or international laws. Users are solely responsible for ensuring compliance with all applicable laws and regulations. The authors assume no liability for misuse or damage caused by this tool.

## 🎉 Hackathon Ready!

This project is fully functional and ready for your hackathon presentation. It demonstrates:
- ✅ Full-stack development skills
- ✅ Enterprise integration (AD, SIEM)
- ✅ Security awareness
- ✅ Modern UI/UX design
- ✅ Real-world applicability
- ✅ Comprehensive documentation

Good luck with your hackathon! 🏆
