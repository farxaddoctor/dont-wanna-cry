# RansomRun - Ransomware Simulation Platform

A comprehensive enterprise-grade ransomware simulation platform with Active Directory and SIEM integration for security testing and training.

## Features

- 🎯 **Interactive Dashboard** - Visualize your organization's network topology
- 🖥️ **Host Management** - View and manage all hosts from Active Directory
- 🦠 **Ransomware Simulations** - Run controlled ransomware simulations
- 🔗 **AD Integration** - Automatic host discovery via Active Directory
- 📊 **SIEM Integration** - Send simulation events to your SIEM (Splunk/ELK/QRadar)
- 🎮 **Simulation Control** - Choose hosts, malware types, and execution parameters
- 📈 **Real-time Monitoring** - Track simulation progress and results
- 🤖 **AI-Generated Reports** - Comprehensive analysis with risk scoring and recommendations
- 🔒 **Safe & Controlled** - All simulations are sandboxed and reversible

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React Web     │◄────►│   Express API    │◄────►│ Active Directory│
│   Dashboard     │      │   (Node.js)      │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   SIEM Platform  │
                         │ (Splunk/ELK/etc) │
                         └──────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+ and npm
- Access to Active Directory
- SIEM platform (Splunk, ELK, or QRadar)
- Windows environment for AD integration

### Setup

1. **Clone and Install Dependencies**
   ```bash
   cd C:\Users\Help\CascadeProjects\ransomware-simulator
   npm install
   cd client && npm install && cd ..
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your AD and SIEM credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Dashboard**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Configuration

### Active Directory Setup

Update `.env` with your AD details:
```env
AD_URL=ldap://dc.ransomrun.local:389
AD_BASE_DN=DC=ransomrun,DC=local
AD_USERNAME=admin@ransomrun.local
AD_PASSWORD=SecurePassword123
```

### SIEM Integration

Configure your SIEM platform:

**For Splunk:**
```env
SIEM_TYPE=splunk
SIEM_URL=https://splunk.ransomrun.local:8089
SIEM_API_KEY=your-splunk-hec-token
SIEM_INDEX=ransomware_sim
```

**For ELK Stack:**
```env
SIEM_TYPE=elk
SIEM_URL=https://elasticsearch.ransomrun.local:9200
SIEM_API_KEY=your-elk-api-key
SIEM_INDEX=ransomware_sim
```

## Ransomware Samples

The platform can pull ransomware samples from GitHub repositories. Supported sources:

- **TheZoo** - Malware database for research
- **Custom Simulators** - Safe ransomware behavior simulators
- **MITRE ATT&CK** - Technique-based simulations

⚠️ **WARNING**: Only use in isolated, controlled environments. Never run on production systems.

## Usage

### 1. View Network Topology
- Navigate to Dashboard
- View all discovered hosts from AD
- See network architecture visualization

### 2. Run Simulation
1. Click "New Simulation"
2. Select target host(s)
3. Choose ransomware type/behavior
4. Configure simulation parameters
5. Review and execute

### 3. Monitor Results
- Real-time simulation progress
- SIEM event correlation
- Detailed logs and reports

## Security Considerations

⚠️ **CRITICAL SAFETY NOTES**:

1. **Isolated Environment Only** - Run only in isolated test environments
2. **Backup Everything** - Ensure all data is backed up before simulations
3. **Network Isolation** - Use network segmentation
4. **Authorized Use Only** - Obtain proper authorization before use
5. **Monitoring** - Always monitor simulations in real-time
6. **Kill Switch** - Emergency stop functionality included

## API Endpoints

### Hosts
- `GET /api/hosts` - List all hosts from AD
- `GET /api/hosts/:id` - Get host details

### Simulations
- `POST /api/simulations` - Create new simulation
- `GET /api/simulations` - List all simulations
- `GET /api/simulations/:id` - Get simulation details
- `POST /api/simulations/:id/stop` - Stop running simulation

### Malware
- `GET /api/malware` - List available ransomware samples
- `GET /api/malware/:id` - Get malware details

### SIEM
- `POST /api/siem/test` - Test SIEM connection
- `GET /api/siem/events` - Query SIEM events

## License

MIT License - For educational and authorized security testing only.

## Disclaimer

This tool is for authorized security testing and training purposes only. Unauthorized use of ransomware or simulation tools may be illegal. Users are responsible for compliance with all applicable laws and regulations.
