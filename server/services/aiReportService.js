const logger = require('../utils/logger');

class AIReportService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.model = process.env.AI_MODEL || 'gpt-4';
  }

  async generateSimulationReport(simulation) {
    try {
      // If OpenAI API is configured, use it for real AI generation
      if (this.apiKey) {
        return await this.generateWithOpenAI(simulation);
      }
      
      // Otherwise, use intelligent template-based generation
      return this.generateIntelligentReport(simulation);
    } catch (error) {
      logger.error('Error generating AI report:', error);
      throw error;
    }
  }

  async generateWithOpenAI(simulation) {
    const axios = require('axios');
    
    const prompt = this.buildPrompt(simulation);
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert analyzing ransomware simulation results. Provide detailed, actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiContent = response.data.choices[0].message.content;
      
      return this.formatReport(simulation, aiContent, true);
    } catch (error) {
      logger.error('OpenAI API error:', error.message);
      // Fallback to intelligent template
      return this.generateIntelligentReport(simulation);
    }
  }

  buildPrompt(simulation) {
    return `
Analyze this ransomware simulation and provide a comprehensive security report:

Simulation Details:
- Malware Type: ${simulation.malware.name}
- Severity: ${simulation.malware.severity}
- Target Hosts: ${simulation.targetHosts.length} systems
- Duration: ${this.calculateDuration(simulation)}
- Status: ${simulation.status}
- Dry Run: ${simulation.config.dryRun ? 'Yes' : 'No'}

Behaviors Simulated:
${simulation.malware.behaviors.map(b => `- ${b}`).join('\n')}

Execution Results:
- Total Steps: ${simulation.results?.length || 0}
- Successful Steps: ${simulation.results?.filter(r => r.success).length || 0}
- Failed Steps: ${simulation.results?.filter(r => !r.success).length || 0}

Affected Systems:
${simulation.targetHosts.map(h => `- ${h.hostname} (${h.department})`).join('\n')}

Please provide:
1. Executive Summary
2. Attack Analysis
3. Impact Assessment
4. Detection Gaps Identified
5. Recommendations for Improvement
6. Lessons Learned
7. Next Steps

Format the response in clear sections with actionable insights.
    `.trim();
  }

  generateIntelligentReport(simulation) {
    const analysis = this.analyzeSimulation(simulation);
    
    const report = {
      id: `report-${simulation.id}`,
      simulationId: simulation.id,
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI Report Engine',
      aiGenerated: false,
      
      executiveSummary: this.generateExecutiveSummary(simulation, analysis),
      
      attackAnalysis: {
        malwareType: simulation.malware.name,
        severity: simulation.malware.severity,
        attackVector: this.determineAttackVector(simulation.malware),
        techniques: simulation.malware.techniques || [],
        behaviors: simulation.malware.behaviors,
        targetedSystems: simulation.targetHosts.length,
        affectedDepartments: [...new Set(simulation.targetHosts.map(h => h.department))]
      },
      
      impactAssessment: this.generateImpactAssessment(simulation, analysis),
      
      detectionGaps: this.identifyDetectionGaps(simulation, analysis),
      
      recommendations: this.generateRecommendations(simulation, analysis),
      
      lessonsLearned: this.generateLessonsLearned(simulation, analysis),
      
      nextSteps: this.generateNextSteps(simulation, analysis),
      
      technicalDetails: {
        duration: this.calculateDuration(simulation),
        totalSteps: simulation.results?.length || 0,
        successfulSteps: simulation.results?.filter(r => r.success).length || 0,
        failedSteps: simulation.results?.filter(r => !r.success).length || 0,
        dryRun: simulation.config.dryRun,
        autoReverted: simulation.config.autoRevert
      },
      
      timeline: this.generateTimeline(simulation),
      
      affectedAssets: this.generateAffectedAssets(simulation),
      
      complianceImpact: this.assessComplianceImpact(simulation, analysis),
      
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel
    };
    
    return report;
  }

  analyzeSimulation(simulation) {
    const successRate = simulation.results?.length > 0
      ? (simulation.results.filter(r => r.success).length / simulation.results.length) * 100
      : 0;
    
    const criticalityScore = this.calculateCriticalityScore(simulation);
    const exposureScore = this.calculateExposureScore(simulation);
    const riskScore = (criticalityScore + exposureScore + (100 - successRate)) / 3;
    
    return {
      successRate,
      criticalityScore,
      exposureScore,
      riskScore: Math.round(riskScore),
      riskLevel: this.getRiskLevel(riskScore),
      vulnerabilitiesFound: this.identifyVulnerabilities(simulation),
      strengths: this.identifyStrengths(simulation),
      weaknesses: this.identifyWeaknesses(simulation)
    };
  }

  calculateCriticalityScore(simulation) {
    let score = 0;
    
    // Severity weight
    const severityWeights = { critical: 100, high: 75, medium: 50, low: 25 };
    score += severityWeights[simulation.malware.severity] || 50;
    
    // Number of affected systems
    score += Math.min(simulation.targetHosts.length * 10, 30);
    
    // Critical departments (Servers, IT)
    const criticalDepts = simulation.targetHosts.filter(h => 
      ['Servers', 'IT', 'Finance'].includes(h.department)
    ).length;
    score += criticalDepts * 5;
    
    return Math.min(score, 100);
  }

  calculateExposureScore(simulation) {
    let score = 0;
    
    // Multiple departments affected
    const deptCount = new Set(simulation.targetHosts.map(h => h.department)).size;
    score += deptCount * 15;
    
    // Behaviors that indicate lateral movement
    const lateralMovement = simulation.malware.behaviors.some(b => 
      b.toLowerCase().includes('network') || 
      b.toLowerCase().includes('propagation') ||
      b.toLowerCase().includes('lateral')
    );
    if (lateralMovement) score += 30;
    
    // Data exfiltration capability
    const dataExfil = simulation.malware.behaviors.some(b => 
      b.toLowerCase().includes('exfiltration') ||
      b.toLowerCase().includes('theft')
    );
    if (dataExfil) score += 25;
    
    return Math.min(score, 100);
  }

  getRiskLevel(score) {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  generateExecutiveSummary(simulation, analysis) {
    const duration = this.calculateDuration(simulation);
    const hostsAffected = simulation.targetHosts.length;
    const departments = [...new Set(simulation.targetHosts.map(h => h.department))];
    
    return {
      overview: `A ${simulation.malware.severity} severity ransomware simulation (${simulation.malware.name}) was conducted against ${hostsAffected} system${hostsAffected > 1 ? 's' : ''} across ${departments.length} department${departments.length > 1 ? 's' : ''}. The simulation ${simulation.status === 'completed' ? 'completed successfully' : 'was ' + simulation.status} in ${duration}.`,
      
      keyFindings: [
        `Overall Risk Level: ${analysis.riskLevel} (${analysis.riskScore}/100)`,
        `Simulation Success Rate: ${analysis.successRate.toFixed(1)}%`,
        `${analysis.vulnerabilitiesFound.length} potential vulnerabilities identified`,
        `${departments.length} departments affected: ${departments.join(', ')}`,
        simulation.config.dryRun ? 'No actual system changes made (dry run mode)' : 'System changes were simulated'
      ],
      
      criticalInsights: [
        analysis.riskLevel === 'Critical' || analysis.riskLevel === 'High'
          ? '⚠️ High-risk attack pattern detected - immediate action recommended'
          : '✓ Moderate risk level - standard security measures appear adequate',
        
        analysis.successRate > 80
          ? '⚠️ High simulation success rate indicates potential security gaps'
          : '✓ Lower success rate suggests effective security controls',
        
        simulation.targetHosts.some(h => h.department === 'Servers')
          ? '⚠️ Critical infrastructure (servers) was targeted'
          : '✓ No critical infrastructure directly targeted'
      ],
      
      immediateActions: analysis.riskLevel === 'Critical' || analysis.riskLevel === 'High'
        ? [
            'Review and strengthen endpoint protection',
            'Verify backup integrity and recovery procedures',
            'Conduct security awareness training',
            'Implement additional network segmentation'
          ]
        : [
            'Continue monitoring for similar attack patterns',
            'Schedule regular security assessments',
            'Maintain current security posture'
          ]
    };
  }

  generateImpactAssessment(simulation, analysis) {
    return {
      businessImpact: {
        level: analysis.riskLevel,
        score: analysis.riskScore,
        description: this.getBusinessImpactDescription(simulation, analysis)
      },
      
      technicalImpact: {
        systemsAffected: simulation.targetHosts.length,
        departments: [...new Set(simulation.targetHosts.map(h => h.department))],
        criticalSystems: simulation.targetHosts.filter(h => 
          ['Servers', 'IT'].includes(h.department)
        ).length,
        dataAtRisk: this.estimateDataAtRisk(simulation)
      },
      
      operationalImpact: {
        estimatedDowntime: this.estimateDowntime(simulation),
        recoveryTime: this.estimateRecoveryTime(simulation),
        productivityLoss: this.estimateProductivityLoss(simulation)
      },
      
      financialImpact: {
        estimatedCost: this.estimateFinancialImpact(simulation),
        breakdown: {
          downtime: 'Variable based on business operations',
          recovery: 'Depends on backup and recovery capabilities',
          remediation: 'Based on extent of compromise',
          reputation: 'Potential customer trust impact'
        }
      }
    };
  }

  identifyDetectionGaps(simulation, analysis) {
    const gaps = [];
    
    // Check if simulation succeeded too easily
    if (analysis.successRate > 75) {
      gaps.push({
        category: 'Endpoint Detection',
        severity: 'High',
        description: 'High simulation success rate suggests weak endpoint detection',
        recommendation: 'Deploy or enhance EDR/XDR solutions'
      });
    }
    
    // Check for lateral movement
    if (simulation.malware.behaviors.some(b => b.toLowerCase().includes('network'))) {
      gaps.push({
        category: 'Network Monitoring',
        severity: 'Medium',
        description: 'Lateral movement capabilities detected',
        recommendation: 'Implement network traffic analysis and anomaly detection'
      });
    }
    
    // Check for data exfiltration
    if (simulation.malware.behaviors.some(b => b.toLowerCase().includes('exfiltration'))) {
      gaps.push({
        category: 'Data Loss Prevention',
        severity: 'High',
        description: 'Data exfiltration simulation succeeded',
        recommendation: 'Deploy DLP solutions and monitor outbound traffic'
      });
    }
    
    // Check for encryption detection
    if (simulation.malware.behaviors.some(b => b.toLowerCase().includes('encryption'))) {
      gaps.push({
        category: 'Behavioral Analysis',
        severity: 'Critical',
        description: 'Mass file encryption not detected in time',
        recommendation: 'Implement behavioral analysis to detect rapid file modifications'
      });
    }
    
    return gaps;
  }

  generateRecommendations(simulation, analysis) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    // Immediate actions (0-7 days)
    if (analysis.riskLevel === 'Critical' || analysis.riskLevel === 'High') {
      recommendations.immediate.push(
        'Verify all backups are current and restorable',
        'Review and update incident response procedures',
        'Conduct emergency security awareness briefing',
        'Enable additional logging and monitoring'
      );
    }
    
    recommendations.immediate.push(
      'Review simulation logs in SIEM',
      'Document lessons learned',
      'Update security playbooks based on findings'
    );
    
    // Short-term actions (1-3 months)
    recommendations.shortTerm.push(
      'Conduct tabletop exercise based on simulation results',
      'Enhance detection rules for observed behaviors',
      'Implement additional network segmentation',
      'Schedule follow-up simulation to validate improvements',
      'Provide targeted security training to affected departments'
    );
    
    // Long-term actions (3-12 months)
    recommendations.longTerm.push(
      'Develop comprehensive ransomware defense strategy',
      'Implement zero-trust architecture principles',
      'Establish regular simulation and testing cadence',
      'Build automated response capabilities',
      'Enhance security monitoring and analytics platform'
    );
    
    return recommendations;
  }

  generateLessonsLearned(simulation, analysis) {
    return {
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      surprises: this.identifySurprises(simulation, analysis),
      improvements: this.identifyImprovements(simulation, analysis)
    };
  }

  generateNextSteps(simulation, analysis) {
    const steps = [
      {
        priority: 1,
        action: 'Review and validate all findings with security team',
        owner: 'Security Team Lead',
        timeline: 'Within 48 hours'
      },
      {
        priority: 2,
        action: 'Update incident response procedures based on simulation',
        owner: 'Incident Response Team',
        timeline: 'Within 1 week'
      },
      {
        priority: 3,
        action: 'Implement high-priority recommendations',
        owner: 'Security Operations',
        timeline: 'Within 2 weeks'
      },
      {
        priority: 4,
        action: 'Schedule follow-up simulation',
        owner: 'Security Testing Team',
        timeline: 'Within 30 days'
      },
      {
        priority: 5,
        action: 'Present findings to management',
        owner: 'CISO',
        timeline: 'Within 1 week'
      }
    ];
    
    if (analysis.riskLevel === 'Critical') {
      steps.unshift({
        priority: 0,
        action: 'Emergency security review and hardening',
        owner: 'Security Team',
        timeline: 'Immediate'
      });
    }
    
    return steps;
  }

  identifyVulnerabilities(simulation) {
    const vulns = [];
    
    simulation.malware.behaviors.forEach(behavior => {
      if (behavior.toLowerCase().includes('encryption')) {
        vulns.push('Lack of real-time file encryption detection');
      }
      if (behavior.toLowerCase().includes('network')) {
        vulns.push('Insufficient network segmentation');
      }
      if (behavior.toLowerCase().includes('privilege')) {
        vulns.push('Potential privilege escalation paths');
      }
      if (behavior.toLowerCase().includes('backup') || behavior.toLowerCase().includes('shadow')) {
        vulns.push('Backup and recovery systems may be vulnerable');
      }
    });
    
    return [...new Set(vulns)];
  }

  identifyStrengths(simulation) {
    const strengths = [];
    
    if (simulation.config.dryRun) {
      strengths.push('Safe testing environment properly configured');
    }
    
    if (simulation.config.autoRevert) {
      strengths.push('Automated rollback capabilities in place');
    }
    
    if (simulation.status === 'completed') {
      strengths.push('Simulation completed successfully - testing infrastructure is robust');
    }
    
    strengths.push('Proactive security testing culture demonstrated');
    strengths.push('SIEM integration enables comprehensive logging');
    
    return strengths;
  }

  identifyWeaknesses(simulation) {
    const weaknesses = [];
    
    if (simulation.targetHosts.some(h => h.department === 'Servers')) {
      weaknesses.push('Critical infrastructure accessible to ransomware');
    }
    
    const deptCount = new Set(simulation.targetHosts.map(h => h.department)).size;
    if (deptCount > 2) {
      weaknesses.push('Lateral movement across multiple departments possible');
    }
    
    if (simulation.malware.severity === 'critical') {
      weaknesses.push('Systems vulnerable to critical-severity attacks');
    }
    
    return weaknesses;
  }

  identifySurprises(simulation, analysis) {
    const surprises = [];
    
    if (analysis.successRate > 90) {
      surprises.push('Unexpectedly high simulation success rate');
    }
    
    if (analysis.riskScore > 80) {
      surprises.push('Higher risk score than anticipated');
    }
    
    return surprises.length > 0 ? surprises : ['No major surprises - results aligned with expectations'];
  }

  identifyImprovements(simulation, analysis) {
    return [
      'Enhanced detection capabilities needed for ransomware behaviors',
      'Faster incident response procedures required',
      'Additional security awareness training recommended',
      'Network segmentation improvements identified',
      'Backup and recovery procedures should be validated'
    ];
  }

  calculateDuration(simulation) {
    if (!simulation.startTime) return 'N/A';
    
    const start = new Date(simulation.startTime);
    const end = simulation.endTime ? new Date(simulation.endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ${diffSecs} second${diffSecs > 1 ? 's' : ''}`;
    }
    return `${diffSecs} second${diffSecs > 1 ? 's' : ''}`;
  }

  generateTimeline(simulation) {
    const timeline = [
      {
        timestamp: simulation.createdAt,
        event: 'Simulation Created',
        details: `Target: ${simulation.targetHosts.length} hosts`
      }
    ];
    
    if (simulation.startTime) {
      timeline.push({
        timestamp: simulation.startTime,
        event: 'Simulation Started',
        details: `Malware: ${simulation.malware.name}`
      });
    }
    
    if (simulation.events && simulation.events.length > 0) {
      simulation.events.slice(0, 10).forEach(event => {
        timeline.push({
          timestamp: event.timestamp,
          event: event.action,
          details: event.description
        });
      });
    }
    
    if (simulation.endTime) {
      timeline.push({
        timestamp: simulation.endTime,
        event: `Simulation ${simulation.status}`,
        details: `Duration: ${this.calculateDuration(simulation)}`
      });
    }
    
    return timeline;
  }

  generateAffectedAssets(simulation) {
    return simulation.targetHosts.map(host => ({
      hostname: host.hostname,
      department: host.department,
      os: host.os,
      ipAddress: host.ipAddress,
      status: host.status,
      impact: this.assessHostImpact(host, simulation)
    }));
  }

  assessHostImpact(host, simulation) {
    if (host.department === 'Servers') return 'Critical';
    if (host.department === 'IT' || host.department === 'Finance') return 'High';
    return 'Medium';
  }

  assessComplianceImpact(simulation, analysis) {
    return {
      gdpr: simulation.targetHosts.some(h => h.department === 'HR' || h.department === 'Finance')
        ? 'Potential personal data exposure'
        : 'No direct personal data impact',
      
      hipaa: 'Not applicable (no healthcare data)',
      
      pciDss: simulation.targetHosts.some(h => h.department === 'Finance')
        ? 'Potential payment data at risk'
        : 'No payment card data affected',
      
      sox: simulation.targetHosts.some(h => h.department === 'Finance')
        ? 'Financial systems affected - SOX compliance review needed'
        : 'No SOX-relevant systems affected',
      
      recommendations: [
        'Document simulation as part of compliance testing',
        'Review data protection measures',
        'Validate incident response procedures meet regulatory requirements'
      ]
    };
  }

  getBusinessImpactDescription(simulation, analysis) {
    if (analysis.riskLevel === 'Critical') {
      return 'Severe business impact expected. Critical systems compromised, potential for significant operational disruption and data loss.';
    }
    if (analysis.riskLevel === 'High') {
      return 'Significant business impact likely. Multiple systems affected with potential for operational disruption and data exposure.';
    }
    if (analysis.riskLevel === 'Medium') {
      return 'Moderate business impact possible. Limited systems affected with manageable operational impact.';
    }
    return 'Low business impact. Minimal operational disruption expected with quick recovery possible.';
  }

  estimateDataAtRisk(simulation) {
    const hostCount = simulation.targetHosts.length;
    const hasServers = simulation.targetHosts.some(h => h.department === 'Servers');
    
    if (hasServers) return `High (${hostCount} systems including critical servers)`;
    if (hostCount > 3) return `Medium (${hostCount} workstations)`;
    return `Low (${hostCount} workstations)`;
  }

  estimateDowntime(simulation) {
    if (simulation.malware.severity === 'critical') return '4-24 hours';
    if (simulation.malware.severity === 'high') return '2-8 hours';
    return '1-4 hours';
  }

  estimateRecoveryTime(simulation) {
    const hostCount = simulation.targetHosts.length;
    if (hostCount > 5) return '1-3 days';
    if (hostCount > 2) return '8-24 hours';
    return '4-12 hours';
  }

  estimateProductivityLoss(simulation) {
    const deptCount = new Set(simulation.targetHosts.map(h => h.department)).size;
    if (deptCount > 3) return 'High - Multiple departments affected';
    if (deptCount > 1) return 'Medium - Several departments impacted';
    return 'Low - Limited departmental impact';
  }

  estimateFinancialImpact(simulation) {
    const hostCount = simulation.targetHosts.length;
    const severity = simulation.malware.severity;
    
    if (severity === 'critical' && hostCount > 5) return '$100,000 - $500,000+';
    if (severity === 'critical' || hostCount > 3) return '$50,000 - $200,000';
    if (severity === 'high') return '$25,000 - $100,000';
    return '$10,000 - $50,000';
  }

  determineAttackVector(malware) {
    // Determine primary attack vector based on malware type and behaviors
    if (malware.type.toLowerCase().includes('phishing')) {
      return 'Phishing / Social Engineering';
    }
    if (malware.behaviors.some(b => b.toLowerCase().includes('network') || b.toLowerCase().includes('smb'))) {
      return 'Network Exploitation / Lateral Movement';
    }
    if (malware.behaviors.some(b => b.toLowerCase().includes('remote'))) {
      return 'Remote Services Exploitation';
    }
    if (malware.type.toLowerCase().includes('ransomware-as-a-service')) {
      return 'Initial Access Broker / RaaS';
    }
    return 'Multiple Vectors / Opportunistic';
  }

  formatReport(simulation, aiContent, isAI = false) {
    return {
      id: `report-${simulation.id}`,
      simulationId: simulation.id,
      generatedAt: new Date().toISOString(),
      generatedBy: isAI ? 'OpenAI GPT-4' : 'AI Report Engine',
      aiGenerated: isAI,
      content: aiContent,
      simulation: {
        id: simulation.id,
        malware: simulation.malware.name,
        status: simulation.status,
        duration: this.calculateDuration(simulation)
      }
    };
  }
}

module.exports = new AIReportService();
