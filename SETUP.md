# Ransomware Simulator - Setup Guide

## Quick Start

### 1. Install Dependencies

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

```powershell
# Copy the example environment file
copy .env.example .env

# Edit .env with your settings
notepad .env
```

### 3. Start Development Server

```powershell
# Start both backend and frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Configuration Details

### Active Directory Setup

1. **LDAP URL**: Your domain controller address
   ```
   AD_URL=ldap://dc.ransomrun.local:389
   ```

2. **Base DN**: Your domain's distinguished name
   ```
   AD_BASE_DN=DC=ransomrun,DC=local
   ```

3. **Credentials**: Service account with read access
   ```
   AD_USERNAME=admin@ransomrun.local
   AD_PASSWORD=YourSecurePassword
   ```

### SIEM Integration

#### For Splunk:

```env
SIEM_TYPE=splunk
SIEM_URL=https://splunk.ransomrun.local:8089
SIEM_API_KEY=your-hec-token
SIEM_INDEX=ransomware_sim
```

To get Splunk HEC token:
1. Settings → Data Inputs → HTTP Event Collector
2. Create new token
3. Copy the token value

#### For ELK Stack:

```env
SIEM_TYPE=elk
SIEM_URL=https://elasticsearch.ransomrun.local:9200
SIEM_API_KEY=your-api-key
SIEM_INDEX=ransomware_sim
```

To create ELK API key:
```bash
curl -X POST "localhost:9200/_security/api_key" -H 'Content-Type: application/json' -d'
{
  "name": "ransomware-sim",
  "role_descriptors": {
    "ransomware_sim_writer": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["ransomware_sim"],
          "privileges": ["write", "create_index"]
        }
      ]
    }
  }
}
'
```

#### For QRadar:

```env
SIEM_TYPE=qradar
SIEM_URL=https://qradar.ransomrun.local
SIEM_API_KEY=your-api-token
```

## Testing Without AD/SIEM

The application includes mock data and will work without Active Directory or SIEM configured:

1. Leave AD credentials empty in `.env`
2. The system will use mock hosts (5 sample machines)
3. SIEM events will be logged locally

## Production Deployment

### 1. Build Frontend

```powershell
cd client
npm run build
cd ..
```

### 2. Configure Production Environment

```powershell
# Set production environment
$env:NODE_ENV="production"

# Use production .env
copy .env.production .env
```

### 3. Start Production Server

```powershell
npm start
```

### 4. Use Process Manager (Optional)

Install PM2 for process management:

```powershell
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name ransomware-simulator

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## Security Considerations

### Network Isolation

1. **Deploy in isolated network segment**
   - Separate VLAN for testing
   - No internet access for simulation targets
   - Firewall rules to prevent lateral movement

2. **Access Control**
   - Use VPN for remote access
   - Implement IP whitelisting
   - Enable audit logging

### Authentication

1. **Change default credentials**
   ```env
   ADMIN_PASSWORD=YourStrongPassword123!
   JWT_SECRET=YourRandomSecretKey
   ```

2. **Use strong passwords**
   - Minimum 12 characters
   - Mix of upper/lower case, numbers, symbols

### Monitoring

1. **Enable logging**
   ```env
   LOG_LEVEL=info
   ```

2. **Monitor SIEM events**
   - Set up alerts for simulation events
   - Review logs regularly

## Troubleshooting

### AD Connection Issues

**Problem**: Cannot connect to Active Directory

**Solutions**:
1. Verify LDAP URL is correct
2. Check firewall allows port 389/636
3. Ensure service account has read permissions
4. Test with `ldapsearch` command:
   ```bash
   ldapsearch -x -H ldap://dc.company.local -D "admin@company.local" -W -b "DC=company,DC=local"
   ```

### SIEM Connection Issues

**Problem**: Events not appearing in SIEM

**Solutions**:
1. Verify SIEM URL and API key
2. Check network connectivity
3. Test with curl:
   ```powershell
   curl -X POST "https://splunk:8088/services/collector/event" `
     -H "Authorization: Splunk YOUR-TOKEN" `
     -d '{"event":"test"}'
   ```

### Port Conflicts

**Problem**: Port 5000 or 5173 already in use

**Solutions**:
1. Change ports in `.env`:
   ```env
   PORT=5001
   ```
2. Update `client/vite.config.js` for frontend port

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Backend: Uses `nodemon` to restart on file changes
- Frontend: Vite provides instant HMR

### API Testing

Use the included REST client or curl:

```powershell
# Get all hosts
curl http://localhost:5000/api/hosts

# Create simulation
curl -X POST http://localhost:5000/api/simulations `
  -H "Content-Type: application/json" `
  -d '{
    "targetHosts": ["1"],
    "malwareId": "wannacry-sim",
    "dryRun": true
  }'
```

### Database

Currently uses in-memory storage. For persistence, consider:
- SQLite for simple deployments
- PostgreSQL for production
- MongoDB for flexible schema

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review SIEM events for simulation details
3. Enable debug logging: `LOG_LEVEL=debug`

## License

MIT License - Educational and authorized security testing only.
