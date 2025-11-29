# 🤖 AI-Generated Reports Feature

## Overview

The Ransomware Simulator now includes an **AI-powered report generation system** that automatically analyzes simulation results and creates comprehensive security reports.

## Features

### 📊 Comprehensive Analysis
- **Executive Summary** - High-level overview for management
- **Attack Analysis** - Detailed breakdown of malware behavior
- **Impact Assessment** - Business, technical, and financial impact
- **Detection Gaps** - Identified security weaknesses
- **Recommendations** - Immediate, short-term, and long-term actions
- **Next Steps** - Prioritized action items with owners and timelines

### 🎯 Risk Scoring
- Automated risk calculation (0-100 scale)
- Risk level classification (Low, Medium, High, Critical)
- Multiple factors considered:
  - Malware severity
  - Number of affected systems
  - Critical infrastructure impact
  - Lateral movement capability
  - Data exfiltration potential

### 📈 Intelligence Features
- MITRE ATT&CK technique mapping
- Compliance impact assessment (GDPR, HIPAA, PCI DSS, SOX)
- Financial impact estimation
- Recovery time estimation
- Productivity loss analysis

### 💾 Export Capability
- Download reports as text files
- Formatted for easy sharing
- Includes all analysis sections

## How It Works

### Without OpenAI API (Default)
The system uses **intelligent template-based generation** that:
- Analyzes simulation data algorithmically
- Calculates risk scores based on multiple factors
- Generates detailed, actionable reports
- Requires no external API or configuration
- **Works out of the box!**

### With OpenAI API (Optional Enhancement)
For even more sophisticated analysis:
1. Add your OpenAI API key to `.env`
2. Reports will use GPT-4 for natural language generation
3. More nuanced insights and recommendations

## Usage

### 1. Run a Simulation
First, complete a ransomware simulation:
- Go to **Simulations** page
- Create and run a simulation
- Wait for it to complete

### 2. Generate Report
Navigate to **AI Reports** page:
- Select a completed simulation from the list
- Report generates automatically
- View comprehensive analysis

### 3. Review Sections

**Executive Summary**
- Overview of the simulation
- Key findings and critical insights
- Immediate actions needed

**Attack Analysis**
- Malware type and severity
- Observed behaviors
- Affected systems and departments
- MITRE ATT&CK techniques

**Impact Assessment**
- Business impact level
- Technical impact details
- Operational impact (downtime, recovery)
- Financial impact estimation

**Detection Gaps**
- Identified security weaknesses
- Severity ratings
- Specific recommendations for each gap

**Recommendations**
- **Immediate** (0-7 days): Critical actions
- **Short-term** (1-3 months): Important improvements
- **Long-term** (3-12 months): Strategic initiatives

**Next Steps**
- Prioritized action items
- Assigned owners
- Timelines for completion

### 4. Download Report
Click **Download** button to save as text file for:
- Management presentations
- Security team reviews
- Compliance documentation
- Audit trails

## Report Metrics Explained

### Risk Score (0-100)
Calculated from:
- **Criticality Score**: Based on malware severity, affected systems, critical infrastructure
- **Exposure Score**: Based on lateral movement, data exfiltration, multi-department impact
- **Success Rate**: How easily the simulation succeeded

### Risk Levels
- **Critical (80-100)**: Immediate action required, severe business impact
- **High (60-79)**: Significant impact, prompt action needed
- **Medium (40-59)**: Moderate impact, standard remediation
- **Low (0-39)**: Minimal impact, routine improvements

### Impact Categories

**Business Impact**
- Operational disruption potential
- Data loss risk
- Reputation impact
- Customer trust effects

**Technical Impact**
- Number of systems affected
- Critical infrastructure involvement
- Data at risk assessment
- Network propagation potential

**Financial Impact**
- Estimated cost ranges based on:
  - Downtime duration
  - Recovery efforts
  - Remediation work
  - Potential fines/penalties

## Configuration (Optional)

### Enable OpenAI Integration

1. Get an OpenAI API key from https://platform.openai.com/api-keys

2. Add to `.env` file:
```env
OPENAI_API_KEY=sk-your-api-key-here
AI_MODEL=gpt-4
```

3. Restart the server

4. Reports will now use GPT-4 for generation

### Cost Considerations
- Template-based reports: **FREE** (no API calls)
- OpenAI reports: ~$0.03-0.10 per report (depending on simulation complexity)
- Most users won't need OpenAI - templates are comprehensive!

## Example Report Structure

```
═══════════════════════════════════════════════════════════
         RANSOMWARE SIMULATION REPORT
═══════════════════════════════════════════════════════════

Report ID: report-abc123
Generated: 2025-11-29 10:30:00
Risk Level: High (Score: 75/100)

───────────────────────────────────────────────────────────
EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────

A high severity ransomware simulation (WannaCry Simulator) 
was conducted against 3 systems across 2 departments...

Key Findings:
• Overall Risk Level: High (75/100)
• Simulation Success Rate: 85.0%
• 2 potential vulnerabilities identified
• 2 departments affected: Finance, IT

Critical Insights:
• ⚠️ High-risk attack pattern detected
• ⚠️ High simulation success rate indicates gaps
• ⚠️ Critical infrastructure (servers) was targeted

Immediate Actions:
• Review and strengthen endpoint protection
• Verify backup integrity and recovery procedures
• Conduct security awareness training

───────────────────────────────────────────────────────────
ATTACK ANALYSIS
───────────────────────────────────────────────────────────

[Detailed analysis continues...]
```

## Best Practices

### 1. Generate Reports Immediately
- Create reports right after simulation completion
- Fresh data provides best insights
- Easier to correlate with SIEM events

### 2. Share with Stakeholders
- Management: Focus on Executive Summary
- Security Team: Full report with technical details
- Compliance: Include compliance impact section

### 3. Track Over Time
- Compare reports from multiple simulations
- Measure improvement in risk scores
- Validate remediation effectiveness

### 4. Use for Training
- Share reports in security awareness sessions
- Demonstrate real attack patterns
- Show business impact of security gaps

### 5. Document Actions
- Use Next Steps section as action tracker
- Assign owners and deadlines
- Follow up on recommendations

## Troubleshooting

### "No completed simulations"
- You need to run and complete a simulation first
- Only completed or stopped simulations can generate reports

### Report generation fails
- Check server logs for errors
- Verify simulation data is complete
- Try regenerating the report

### OpenAI API errors
- Verify API key is correct
- Check API quota/billing
- System falls back to templates automatically

## Technical Details

### Report Generation Algorithm

1. **Data Collection**
   - Gather simulation metadata
   - Collect execution results
   - Analyze affected systems

2. **Risk Calculation**
   - Calculate criticality score
   - Calculate exposure score
   - Compute overall risk

3. **Gap Analysis**
   - Identify detection weaknesses
   - Assess security controls
   - Determine vulnerabilities

4. **Recommendation Engine**
   - Generate immediate actions
   - Create short-term plan
   - Develop long-term strategy

5. **Report Formatting**
   - Structure all sections
   - Add visual indicators
   - Prepare for export

### API Endpoints

```javascript
// Generate new report
POST /api/reports/generate/:simulationId

// Get cached report
GET /api/reports/:simulationId
```

## Future Enhancements

Planned features:
- PDF export with charts
- Email delivery
- Scheduled report generation
- Trend analysis across multiple simulations
- Custom report templates
- Integration with ticketing systems

## Support

For questions or issues:
1. Check simulation completed successfully
2. Review server logs
3. Verify all services are running
4. Template-based reports always work (no API needed)

---

**Remember**: The AI Reports feature works perfectly without any external APIs. The intelligent template system provides comprehensive, actionable reports out of the box!
