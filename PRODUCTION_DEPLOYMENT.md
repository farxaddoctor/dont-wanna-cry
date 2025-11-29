# 🚀 Production Deployment Guide

## Real-World Active Directory Integration

### Step-by-Step Setup

## 1. Network Requirements

### Firewall Rules
```
Source: Simulator Server
Destination: Domain Controller
Ports: 
  - 389 (LDAP)
  - 636 (LDAPS - recommended)
  - 3268 (Global Catalog)
Protocol: TCP
```

### Network Segmentation
```
┌─────────────────────────────────────────────────────┐
│              Management Network (VLAN 10)           │
│  ┌──────────────┐         ┌──────────────┐        │
│  │  Simulator   │◄───────►│    Admin     │        │
│  │   Server     │         │  Workstation │        │
│  └──────┬───────┘         └──────────────┘        │
└─────────┼───────────────────────────────────────────┘
          │ (Controlled Access)
┌─────────▼───────────────────────────────────────────┐
│           Production Network (VLAN 20)              │
│  ┌──────────────┐         ┌──────────────┐        │
│  │   Domain     │         │  Target      │        │
│  │  Controller  │         │  Hosts       │        │
│  └──────────────┘         └──────────────┘        │
└─────────────────────────────────────────────────────┘
```

## 2. Active Directory Setup

### Create Service Account

```powershell
# Run on Domain Controller as Domain Admin

# Create OU for service accounts (if not exists)
New-ADOrganizationalUnit -Name "Service Accounts" -Path "DC=ransomrun,DC=local"

# Create service account
$password = ConvertTo-SecureString "ComplexP@ssw0rd123!" -AsPlainText -Force
New-ADUser `
  -Name "Ransomware Simulator Service" `
  -SamAccountName "svc_ransomsim" `
  -UserPrincipalName "svc_ransomsim@ransomrun.local" `
  -Path "OU=Service Accounts,DC=ransomrun,DC=local" `
  -AccountPassword $password `
  -Enabled $true `
  -PasswordNeverExpires $true `
  -CannotChangePassword $true `
  -Description "Service account for Ransomware Simulator - READ ONLY"

# Set account properties
Set-ADUser -Identity "svc_ransomsim" `
  -PasswordNotRequired $false `
  -SmartcardLogonRequired $false
```

### Set Minimal Permissions

```powershell
# Create custom security group
New-ADGroup `
  -Name "RansomSim-Readers" `
  -GroupScope DomainLocal `
  -GroupCategory Security `
  -Path "OU=Service Accounts,DC=ransomrun,DC=local" `
  -Description "Read-only access for Ransomware Simulator"

# Add service account to group
Add-ADGroupMember -Identity "RansomSim-Readers" -Members "svc_ransomsim"

# Delegate read permissions (run in ADSI Edit or use dsacls)
# This gives read access to computer objects only
dsacls "DC=ransomrun,DC=local" /G "ransomrun\RansomSim-Readers:GR"
```

### Verify Permissions

```powershell
# Test service account can read computers
$cred = Get-Credential # Enter svc_ransomsim credentials

Get-ADComputer -Filter * -Credential $cred | Select-Object Name, DNSHostName, OperatingSystem

# Should return list of computers
# If error, check permissions
```

## 3. Configure Application

### Production .env File

```env
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

# Server
PORT=5000
NODE_ENV=production

# Active Directory - PRODUCTION
AD_URL=ldaps://dc01.ransomrun.local:636
AD_BASE_DN=DC=ransomrun,DC=local
AD_USERNAME=svc_ransomsim@ransomrun.local
AD_PASSWORD=ComplexP@ssw0rd123!

# SIEM Integration - PRODUCTION
SIEM_TYPE=splunk
SIEM_URL=https://splunk.ransomrun.local:8089
SIEM_API_KEY=your-production-hec-token
SIEM_INDEX=ransomware_simulations

# Security - CHANGE THESE!
JWT_SECRET=generate-random-64-char-string-here
ADMIN_PASSWORD=VerySecureAdminP@ssw0rd!

# Simulation Settings
SIMULATION_TIMEOUT=300000
MAX_CONCURRENT_SIMULATIONS=3

# Logging
LOG_LEVEL=info

# AI Reports (Optional)
OPENAI_API_KEY=sk-your-key-if-you-want-ai-reports
AI_MODEL=gpt-4
```

### Secure the .env File

```powershell
# Set file permissions (Windows)
icacls .env /inheritance:r
icacls .env /grant:r "SYSTEM:(F)"
icacls .env /grant:r "Administrators:(F)"
icacls .env /grant:r "YourServiceAccount:(R)"

# Verify
icacls .env
```

## 4. LDAPS Configuration (Recommended)

### Enable LDAPS on Domain Controller

```powershell
# Check if LDAPS is enabled
Test-NetConnection -ComputerName dc01.ransomrun.local -Port 636

# If not enabled, install certificate
# Option 1: Use Enterprise CA
# Option 2: Use self-signed (testing only)

# Install certificate on DC
$cert = New-SelfSignedCertificate `
  -DnsName "dc01.ransomrun.local" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -KeySpec KeyExchange

# Export and import to Trusted Root
Export-Certificate -Cert $cert -FilePath "C:\temp\dc-cert.cer"
Import-Certificate -FilePath "C:\temp\dc-cert.cer" -CertStoreLocation "cert:\LocalMachine\Root"

# Restart AD services
Restart-Service NTDS -Force
```

### Trust Certificate on Simulator Server

```powershell
# Copy certificate to simulator server
# Import to Trusted Root Certificates
Import-Certificate -FilePath "\\dc01\share\dc-cert.cer" -CertStoreLocation "cert:\LocalMachine\Root"
```

## 5. SIEM Integration

### Splunk Configuration

```bash
# On Splunk Server

# Create index
splunk add index ransomware_simulations -auth admin:password

# Create HEC token
splunk http-event-collector create ransomware_sim \
  -uri https://localhost:8089 \
  -auth admin:password \
  -index ransomware_simulations

# Enable HEC
splunk http-event-collector enable -uri https://localhost:8089 -auth admin:password

# Get token
splunk http-event-collector list -uri https://localhost:8089 -auth admin:password
```

### ELK Stack Configuration

```bash
# Create index template
curl -X PUT "localhost:9200/_index_template/ransomware_sim" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["ransomware_sim*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    }
  }
}
'

# Create API key
curl -X POST "localhost:9200/_security/api_key" -H 'Content-Type: application/json' -d'
{
  "name": "ransomware_simulator",
  "role_descriptors": {
    "ransomware_writer": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["ransomware_sim*"],
          "privileges": ["write", "create_index"]
        }
      ]
    }
  }
}
'
```

## 6. Install as Windows Service

### Using NSSM (Non-Sucking Service Manager)

```powershell
# Download NSSM
Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "nssm.zip"
Expand-Archive -Path "nssm.zip" -DestinationPath "C:\Tools"

# Install service
cd C:\Tools\nssm-2.24\win64
.\nssm.exe install RansomwareSimulator "C:\Program Files\nodejs\node.exe" "C:\RansomSim\server\index.js"

# Configure service
.\nssm.exe set RansomwareSimulator AppDirectory "C:\RansomSim"
.\nssm.exe set RansomwareSimulator DisplayName "Ransomware Simulator"
.\nssm.exe set RansomwareSimulator Description "Enterprise Ransomware Simulation Platform"
.\nssm.exe set RansomwareSimulator Start SERVICE_AUTO_START
.\nssm.exe set RansomwareSimulator AppStdout "C:\RansomSim\logs\service.log"
.\nssm.exe set RansomwareSimulator AppStderr "C:\RansomSim\logs\service-error.log"

# Set service account (optional - use dedicated service account)
.\nssm.exe set RansomwareSimulator ObjectName ".\ServiceAccount" "ServicePassword"

# Start service
Start-Service RansomwareSimulator

# Verify
Get-Service RansomwareSimulator
```

### Using PM2 (Alternative)

```powershell
# Install PM2 globally
npm install -g pm2
npm install -g pm2-windows-service

# Setup PM2 as service
pm2-service-install -n PM2-RansomSim

# Start application
cd C:\RansomSim
pm2 start server\index.js --name ransomware-simulator

# Save configuration
pm2 save

# Setup startup
pm2 startup
```

## 7. Web Server Configuration (IIS/Nginx)

### Option 1: IIS as Reverse Proxy

```xml
<!-- web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:5000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### Option 2: Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name ransomsim.yourdomain.local;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

## 8. Security Hardening

### Application Security

```powershell
# 1. Run as non-admin user
# 2. Restrict file permissions
icacls "C:\RansomSim" /inheritance:r
icacls "C:\RansomSim" /grant "SYSTEM:(OI)(CI)F"
icacls "C:\RansomSim" /grant "Administrators:(OI)(CI)F"
icacls "C:\RansomSim" /grant "ServiceAccount:(OI)(CI)RX"

# 3. Enable Windows Firewall rules
New-NetFirewallRule -DisplayName "RansomSim-Inbound" `
  -Direction Inbound `
  -LocalPort 5000,5173 `
  -Protocol TCP `
  -Action Allow `
  -Profile Domain

# 4. Enable audit logging
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
```

### Network Security

```
1. Use VPN for remote access
2. Implement IP whitelisting
3. Enable MFA for admin access
4. Use HTTPS only (no HTTP)
5. Regular security audits
```

## 9. Monitoring & Logging

### Windows Event Log

```powershell
# Create custom event log
New-EventLog -LogName "RansomwareSimulator" -Source "RansomSim"

# Write test event
Write-EventLog -LogName "RansomwareSimulator" `
  -Source "RansomSim" `
  -EventId 1000 `
  -EntryType Information `
  -Message "Simulator started successfully"
```

### Application Monitoring

```javascript
// Add to server/index.js
const os = require('os');

setInterval(() => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  logger.info('System metrics', {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: process.uptime()
  });
}, 300000); // Every 5 minutes
```

## 10. Backup & Recovery

### Backup Strategy

```powershell
# Backup script
$backupPath = "\\backup-server\RansomSim\$(Get-Date -Format 'yyyy-MM-dd')"
New-Item -ItemType Directory -Path $backupPath -Force

# Backup configuration
Copy-Item "C:\RansomSim\.env" -Destination "$backupPath\.env"
Copy-Item "C:\RansomSim\logs" -Destination "$backupPath\logs" -Recurse

# Backup database (if using one)
# mongodump or pg_dump commands here

Write-Host "Backup completed: $backupPath"
```

### Disaster Recovery

```powershell
# Restore script
$restorePath = "\\backup-server\RansomSim\2025-11-29"

# Stop service
Stop-Service RansomwareSimulator

# Restore files
Copy-Item "$restorePath\.env" -Destination "C:\RansomSim\.env" -Force
Copy-Item "$restorePath\logs" -Destination "C:\RansomSim\logs" -Recurse -Force

# Start service
Start-Service RansomwareSimulator
```

## 11. Testing Checklist

```
□ AD connection successful
□ Hosts discovered from AD
□ SIEM events logging correctly
□ Simulations run successfully
□ Reports generate correctly
□ Service starts automatically
□ Logs rotating properly
□ Backups running
□ Monitoring alerts working
□ SSL certificates valid
□ Firewall rules correct
□ Permissions set correctly
```

## 12. Maintenance

### Weekly Tasks
- Review logs for errors
- Check disk space
- Verify AD connectivity
- Test SIEM integration

### Monthly Tasks
- Update dependencies (`npm audit fix`)
- Review and rotate service account passwords
- Test disaster recovery
- Security audit

### Quarterly Tasks
- Update SSL certificates
- Review and update firewall rules
- Performance optimization
- User training refresher

## 13. Troubleshooting

### AD Connection Issues

```powershell
# Test LDAP connectivity
Test-NetConnection -ComputerName dc01.yourdomain.local -Port 389

# Test authentication
$cred = Get-Credential
Get-ADComputer -Filter * -Credential $cred

# Check service account
Get-ADUser -Identity svc_ransomsim -Properties *
```

### SIEM Integration Issues

```powershell
# Test Splunk HEC
$headers = @{"Authorization"="Splunk your-token"}
$body = @{event="test"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://splunk:8088/services/collector/event" `
  -Method Post -Headers $headers -Body $body
```

### Performance Issues

```powershell
# Check resource usage
Get-Process -Name node | Select-Object CPU, WorkingSet, VirtualMemorySize

# Check event logs
Get-EventLog -LogName "RansomwareSimulator" -Newest 50
```

## 14. Support & Documentation

### Internal Documentation
- Network diagram
- Service account details
- Escalation procedures
- Contact information

### User Training
- How to run simulations
- How to interpret reports
- Emergency procedures
- Best practices

---

## Quick Reference

### Start/Stop Service
```powershell
Start-Service RansomwareSimulator
Stop-Service RansomwareSimulator
Restart-Service RansomwareSimulator
```

### View Logs
```powershell
Get-Content C:\RansomSim\logs\combined.log -Tail 50 -Wait
```

### Test AD Connection
```powershell
# Via API
Invoke-RestMethod -Uri "http://localhost:5000/api/hosts/test/connection"
```

### Emergency Stop All Simulations
```powershell
# Via API
Invoke-RestMethod -Uri "http://localhost:5000/api/simulations" | 
  Where-Object {$_.status -eq 'running'} | 
  ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:5000/api/simulations/$($_.id)/stop" -Method Post
  }
```

---

**Remember**: This is a security testing tool. Always follow your organization's change management and security policies!
