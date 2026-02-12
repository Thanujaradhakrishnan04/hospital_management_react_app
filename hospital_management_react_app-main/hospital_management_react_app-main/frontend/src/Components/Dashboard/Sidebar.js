import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';

const Sidebar = ({ user }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State management
    const [isChatbotOpen, setIsChatbotOpen] = useState(true);
    const [messages, setMessages] = useState([
        { 
            text: "🏥 **Advanced Hospital AI Assistant**\n\nI can help you with:\n• Patient analysis & recommendations\n• Doctor performance insights\n• Bed optimization suggestions\n• Emergency response guidance\n• Data-driven decision support\n• Latency & bottleneck detection\n\nTry: 'Analyze patient trends' or 'Suggest bed optimization'", 
            type: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hospitalData, setHospitalData] = useState({
        patients: [],
        beds: [],
        staff: [],
        stats: null
    });
    const [aiInsights, setAiInsights] = useState([]);
    const [alertLevel, setAlertLevel] = useState('normal'); // normal, warning, critical
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch all data on component mount
    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [patientsRes, bedsRes, staffRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/patients', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/beds', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/staff', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/beds/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setHospitalData({
                patients: patientsRes.data,
                beds: bedsRes.data,
                staff: staffRes.data,
                stats: statsRes.data
            });

            // Generate AI insights from data
            generateAIInsights(patientsRes.data, bedsRes.data, staffRes.data, statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // AI Recommendation Engine
    const generateAIInsights = (patients, beds, staff, stats) => {
        const insights = [];
        const alerts = [];

        // 1. Bed Occupancy Analysis
        const occupancyRate = (stats.occupied / stats.total) * 100;
        if (occupancyRate > 85) {
            insights.push({
                type: 'warning',
                title: 'High Bed Occupancy',
                message: `Bed occupancy at ${occupancyRate.toFixed(1)}%. Consider activating backup beds.`,
                priority: 'high',
                action: 'activate_emergency_beds'
            });
            setAlertLevel('warning');
        }

        // 2. Patient Emergency Analysis
        const criticalPatients = patients.filter(p => p.emergencyLevel === 'critical');
        const highPatients = patients.filter(p => p.emergencyLevel === 'high');
        
        if (criticalPatients.length > 3) {
            alerts.push({
                type: 'critical',
                title: 'Multiple Critical Patients',
                message: `${criticalPatients.length} critical patients need immediate attention.`,
                patients: criticalPatients.map(p => p.name)
            });
            setAlertLevel('critical');
        }

        // 3. Doctor Workload Analysis
        const doctors = staff.filter(s => s.role === 'doctor' && s.isApproved);
        const assignedPatients = patients.filter(p => p.assignedDoctor);
        
        const doctorWorkload = {};
        doctors.forEach(doctor => {
            const patientsCount = assignedPatients.filter(p => 
                p.assignedDoctor && p.assignedDoctor._id === doctor._id
            ).length;
            doctorWorkload[doctor._id] = {
                doctor: doctor.name,
                count: patientsCount,
                maxCapacity: 8 // Assume max 8 patients per doctor
            };
        });

        // Find overloaded doctors
        Object.entries(doctorWorkload).forEach(([id, data]) => {
            if (data.count > data.maxCapacity) {
                insights.push({
                    type: 'workload',
                    title: 'High Doctor Workload',
                    message: `Dr. ${data.doctor} is managing ${data.count} patients (max: ${data.maxCapacity}). Consider reassignment.`,
                    priority: 'medium',
                    action: 'reassign_patients',
                    doctorId: id
                });
            }
        });

        // 4. Department Load Analysis
        const deptAnalysis = {};
        patients.forEach(patient => {
            const dept = patient.department || 'general';
            if (!deptAnalysis[dept]) deptAnalysis[dept] = { count: 0, critical: 0 };
            deptAnalysis[dept].count++;
            if (patient.emergencyLevel === 'critical') deptAnalysis[dept].critical++;
        });

        Object.entries(deptAnalysis).forEach(([dept, data]) => {
            if (data.critical > 0) {
                insights.push({
                    type: 'department',
                    title: `${dept} Department Alert`,
                    message: `${data.critical} critical patient(s) in ${dept}`,
                    priority: data.critical > 2 ? 'high' : 'medium'
                });
            }
        });

        // 5. Resource Optimization Suggestions
        const availableICU = beds.filter(b => b.type === 'icu' && b.status === 'available').length;
        const neededICU = criticalPatients.length;
        
        if (neededICU > availableICU) {
            insights.push({
                type: 'resource',
                title: 'ICU Bed Shortage',
                message: `${neededICU - availableICU} more ICU beds needed for critical patients.`,
                priority: 'high',
                action: 'upgrade_beds'
            });
        }

        setAiInsights(insights.slice(0, 5)); // Show top 5 insights
    };

    // Advanced Query Processing with AI Capabilities
    const processAdvancedQuery = async (query) => {
        setIsTyping(true);
        const token = localStorage.getItem('token');
        const lowerQuery = query.toLowerCase();

        try {
            // Wait to simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 800));

            // PATIENT INTELLIGENCE MODULE
            if (lowerQuery.includes('patient') || lowerQuery.includes('patients')) {
                return await processPatientIntelligence(query);
            }

            // DOCTOR INTELLIGENCE MODULE
            if (lowerQuery.includes('doctor') || lowerQuery.includes('doctors')) {
                return await processDoctorIntelligence(query);
            }

            // BED OPTIMIZATION MODULE
            if (lowerQuery.includes('bed') || lowerQuery.includes('beds')) {
                return await processBedIntelligence(query);
            }

            // ANALYTICS & RECOMMENDATIONS
            if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
                return await processAnalytics(query);
            }

            // EMERGENCY & ALERTS
            if (lowerQuery.includes('emergency') || lowerQuery.includes('alert') || lowerQuery.includes('critical')) {
                return await processEmergencyAnalysis(query);
            }

            // DECISION SUPPORT
            if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('advice')) {
                return await processRecommendations(query);
            }

            // TREND ANALYSIS
            if (lowerQuery.includes('trend') || lowerQuery.includes('pattern') || lowerQuery.includes('statistics')) {
                return await processTrendAnalysis(query);
            }

            // HELP & GUIDANCE
            if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
                return getHelpMessage();
            }

            // DEFAULT RESPONSE with smart suggestions
            return generateSmartResponse(query);

        } catch (error) {
            console.error('AI Processing Error:', error);
            return "⚠️ **AI Service Error**\nI'm experiencing technical difficulties. Please try again in a moment.";
        } finally {
            setIsTyping(false);
        }
    };

    const processPatientIntelligence = async (query) => {
        const lowerQuery = query.toLowerCase();
        const { patients } = hospitalData;
        
        if (lowerQuery.includes('find patient') || lowerQuery.includes('search patient')) {
            const namePattern = query.match(/patient\s+([a-zA-Z\s]+)/i) || 
                               query.match(/find\s+([a-zA-Z\s]+)/i);
            if (namePattern) {
                const searchName = namePattern[1].trim();
                const foundPatients = patients.filter(p => 
                    p.name.toLowerCase().includes(searchName.toLowerCase())
                );
                
                if (foundPatients.length > 0) {
                    let response = `🔍 **Found ${foundPatients.length} Patient(s)**\n\n`;
                    foundPatients.slice(0, 3).forEach(patient => {
                        const doctorInfo = patient.assignedDoctor ? 
                            `Dr. ${patient.assignedDoctor.name}` : 'Unassigned';
                        const daysAdmitted = Math.floor((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24));
                        
                        response += `**${patient.name}**\n`;
                        response += `• Age: ${patient.age} | Gender: ${patient.gender}\n`;
                        response += `• Condition: ${patient.condition}\n`;
                        response += `• Room: ${patient.roomNumber} | Bed: ${patient.bedId?.bedNumber || 'N/A'}\n`;
                        response += `• Doctor: ${doctorInfo}\n`;
                        response += `• Emergency: ${patient.emergencyLevel.toUpperCase()} (${daysAdmitted} days)\n`;
                        response += `• Status: ${patient.status}\n\n`;
                    });
                    
                    if (foundPatients.length > 3) {
                        response += `*...and ${foundPatients.length - 3} more patients*`;
                    }
                    
                    return response;
                }
                return `❌ **No patients found** matching "${searchName}"`;
            }
        }

        if (lowerQuery.includes('critical') || lowerQuery.includes('emergency')) {
            const criticalPatients = patients.filter(p => 
                p.emergencyLevel === 'critical' || p.emergencyLevel === 'high'
            );
            
            if (criticalPatients.length === 0) {
                return "✅ **No Critical Patients**\nAll patients are stable.";
            }
            
            let response = `🚨 **Critical Patients Alert** (${criticalPatients.length})\n\n`;
            criticalPatients.forEach((patient, index) => {
                const timeCritical = Math.floor((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60));
                response += `${index + 1}. **${patient.name}**\n`;
                response += `   📍 Room: ${patient.roomNumber}\n`;
                response += `   ⚕️ Condition: ${patient.condition}\n`;
                response += `   ⏰ Critical for: ${timeCritical} hours\n`;
                response += `   👨‍⚕️ Doctor: ${patient.assignedDoctor?.name || 'Unassigned'}\n\n`;
            });
            
            response += "**AI Recommendation:**\n";
            response += "• Prioritize immediate review\n";
            response += "• Consider ICU transfer if needed\n";
            response += "• Notify specialists\n";
            
            return response;
        }

        if (lowerQuery.includes('admission trend') || lowerQuery.includes('patient trend')) {
            // Analyze admission patterns
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const recentPatients = patients.filter(p => 
                new Date(p.admissionDate) > lastWeek
            );
            
            const byDay = {};
            recentPatients.forEach(patient => {
                const day = new Date(patient.admissionDate).toLocaleDateString('en-US', { weekday: 'short' });
                byDay[day] = (byDay[day] || 0) + 1;
            });
            
            let response = "📈 **Admission Trends (Last 7 Days)**\n\n";
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            days.forEach(day => {
                const count = byDay[day] || 0;
                const bar = '█'.repeat(Math.min(count, 10));
                response += `${day}: ${bar} ${count}\n`;
            });
            
            const avgDaily = recentPatients.length / 7;
            response += `\n**Analysis:**\n`;
            response += `• Average daily admissions: ${avgDaily.toFixed(1)}\n`;
            response += `• Busiest day: ${Object.keys(byDay).reduce((a, b) => byDay[a] > byDay[b] ? a : b)}\n`;
            response += `• Slowest day: ${Object.keys(byDay).reduce((a, b) => byDay[a] < byDay[b] ? a : b)}\n`;
            
            return response;
        }

        return `📊 **Patient Intelligence**\n\nTotal Patients: ${patients.length}\n• Admitted: ${patients.filter(p => p.status === 'admitted').length}\n• Critical: ${patients.filter(p => p.emergencyLevel === 'critical').length}\n• High Priority: ${patients.filter(p => p.emergencyLevel === 'high').length}\n\n**Try:**\n• "Find patient [name]"\n• "Show critical patients"\n• "Patient admission trends"`;
    };

    const processDoctorIntelligence = async (query) => {
        const { staff, patients } = hospitalData;
        const doctors = staff.filter(s => s.role === 'doctor' && s.isApproved);
        
        if (lowerQuery.includes('doctor performance') || lowerQuery.includes('doctor workload')) {
            let response = "👨‍⚕️ **Doctor Performance Analysis**\n\n";
            
            doctors.forEach(doctor => {
                const assignedPatients = patients.filter(p => 
                    p.assignedDoctor && p.assignedDoctor._id === doctor._id
                );
                const criticalPatients = assignedPatients.filter(p => 
                    p.emergencyLevel === 'critical' || p.emergencyLevel === 'high'
                );
                const successRate = assignedPatients.length > 0 ? 
                    Math.round((assignedPatients.filter(p => p.status === 'discharged').length / assignedPatients.length) * 100) : 0;
                
                response += `**Dr. ${doctor.name}**\n`;
                response += `• Patients: ${assignedPatients.length}\n`;
                response += `• Critical Cases: ${criticalPatients.length}\n`;
                response += `• Success Rate: ${successRate}%\n`;
                response += `• Specialization: ${doctor.specialization || 'General'}\n\n`;
            });
            
            return response;
        }

        if (lowerQuery.includes('available doctor') || lowerQuery.includes('assign doctor')) {
            const availableDoctors = doctors.filter(doctor => {
                const assignedCount = patients.filter(p => 
                    p.assignedDoctor && p.assignedDoctor._id === doctor._id
                ).length;
                return assignedCount < 8; // Available if less than 8 patients
            });
            
            let response = "🔄 **Available Doctors for Assignment**\n\n";
            availableDoctors.forEach(doctor => {
                const assignedCount = patients.filter(p => 
                    p.assignedDoctor && p.assignedDoctor._id === doctor._id
                ).length;
                response += `• **Dr. ${doctor.name}**\n`;
                response += `  Available Slots: ${8 - assignedCount}\n`;
                response += `  Specialization: ${doctor.specialization || 'General'}\n`;
                response += `  Contact: ${doctor.contact || 'N/A'}\n\n`;
            });
            
            return response;
        }

        return `👨‍⚕️ **Doctor Intelligence**\n\nTotal Doctors: ${doctors.length}\n• Available: ${doctors.filter(d => {
            const assignedCount = patients.filter(p => 
                p.assignedDoctor && p.assignedDoctor._id === d._id
            ).length;
            return assignedCount < 8;
        }).length}\n\n**Try:**\n• "Doctor performance"\n• "Available doctors"\n• "Best doctor for [condition]"`;
    };

    const processBedIntelligence = async (query) => {
        const { beds, stats, patients } = hospitalData;
        
        if (lowerQuery.includes('optimize beds') || lowerQuery.includes('bed allocation')) {
            const icuBeds = beds.filter(b => b.type === 'icu');
            const generalBeds = beds.filter(b => b.type === 'general');
            const occupiedICU = icuBeds.filter(b => b.status === 'occupied').length;
            const occupiedGeneral = generalBeds.filter(b => b.status === 'occupied').length;
            
            const criticalPatients = patients.filter(p => p.emergencyLevel === 'critical');
            const needsICU = criticalPatients.length - occupiedICU;
            
            let response = "🛌 **Bed Optimization Analysis**\n\n";
            response += `**Current Status:**\n`;
            response += `• ICU Beds: ${occupiedICU}/${icuBeds.length} occupied\n`;
            response += `• General Beds: ${occupiedGeneral}/${generalBeds.length} occupied\n`;
            response += `• Critical Patients needing ICU: ${Math.max(0, needsICU)}\n\n`;
            
            response += `**AI Recommendations:**\n`;
            if (needsICU > 0) {
                response += `1. 🚨 Convert ${needsICU} general beds to ICU\n`;
            }
            if (occupiedGeneral > generalBeds.length * 0.8) {
                response += `2. 📋 Consider early discharge for stable patients\n`;
            }
            response += `3. 📊 Review bed utilization by department\n`;
            
            return response;
        }

        if (lowerQuery.includes('bed waiting time') || lowerQuery.includes('bed latency')) {
            // Simulate bed waiting time calculation
            const emergencyPatients = patients.filter(p => 
                p.emergencyLevel === 'critical' || p.emergencyLevel === 'high'
            );
            const availableICU = beds.filter(b => b.type === 'icu' && b.status === 'available').length;
            
            let response = "⏱️ **Bed Waiting Time Analysis**\n\n";
            response += `• Emergency Patients waiting: ${emergencyPatients.length}\n`;
            response += `• Available ICU Beds: ${availableICU}\n`;
            response += `• Estimated wait time: ${emergencyPatients.length > availableICU ? 
                `${Math.round((emergencyPatients.length - availableICU) * 0.5)} hours` : 'Immediate'}\n\n`;
            
            response += `**Priority Queue:**\n`;
            emergencyPatients.slice(0, 5).forEach((patient, index) => {
                response += `${index + 1}. ${patient.name} - ${patient.condition}\n`;
            });
            
            return response;
        }

        return `🛏️ **Bed Intelligence**\n\n${stats ? 
            `Total Beds: ${stats.total}\n• Available: ${stats.available}\n• Occupied: ${stats.occupied}\n• Occupancy Rate: ${Math.round((stats.occupied / stats.total) * 100)}%` : 
            'Loading bed data...'}\n\n**Try:**\n• "Optimize bed allocation"\n• "Bed waiting times"\n• "ICU bed status"`;
    };

    const processAnalytics = async (query) => {
        const { patients, beds, staff } = hospitalData;
        
        let response = "📊 **Advanced Hospital Analytics**\n\n";
        
        // Patient Analytics
        const patientCount = patients.length;
        const criticalCount = patients.filter(p => p.emergencyLevel === 'critical').length;
        const avgAge = patientCount > 0 ? 
            Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patientCount) : 0;
        
        response += `**Patient Analytics:**\n`;
        response += `• Total Patients: ${patientCount}\n`;
        response += `• Average Age: ${avgAge}\n`;
        response += `• Critical Cases: ${criticalCount}\n`;
        response += `• Admission Rate: ${Math.round(patientCount / 30)}/day (estimated)\n\n`;
        
        // Resource Analytics
        response += `**Resource Analytics:**\n`;
        if (hospitalData.stats) {
            response += `• Bed Occupancy: ${Math.round((hospitalData.stats.occupied / hospitalData.stats.total) * 100)}%\n`;
            response += `• ICU Utilization: ${Math.round((beds.filter(b => b.type === 'icu' && b.status === 'occupied').length / 
                beds.filter(b => b.type === 'icu').length) * 100)}%\n`;
        }
        
        // Staff Analytics
        const activeDoctors = staff.filter(s => s.role === 'doctor' && s.isApproved).length;
        const activeNurses = staff.filter(s => s.role === 'nurse' && s.isApproved).length;
        response += `• Doctor-to-Patient Ratio: 1:${Math.round(patientCount / activeDoctors) || 'N/A'}\n`;
        response += `• Nurse-to-Patient Ratio: 1:${Math.round(patientCount / activeNurses) || 'N/A'}\n\n`;
        
        // AI Insights
        response += `**AI Insights:**\n`;
        aiInsights.slice(0, 3).forEach(insight => {
            response += `• ${insight.title}\n`;
        });
        
        return response;
    };

    const processEmergencyAnalysis = async (query) => {
        const { patients } = hospitalData;
        const emergencyPatients = patients.filter(p => 
            p.emergencyLevel === 'critical' || p.emergencyLevel === 'high'
        );
        
        let response = "🚨 **Emergency Situation Analysis**\n\n";
        
        if (emergencyPatients.length === 0) {
            return "✅ **No Emergency Cases**\nAll patients are stable.";
        }
        
        response += `**Active Emergencies:** ${emergencyPatients.length}\n\n`;
        
        emergencyPatients.forEach((patient, index) => {
            const hoursCritical = Math.floor((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60));
            response += `${index + 1}. **${patient.name}**\n`;
            response += `   ⚕️ ${patient.condition}\n`;
            response += `   📍 Room ${patient.roomNumber}\n`;
            response += `   ⏰ ${hoursCritical} hours in emergency\n`;
            response += `   👨‍⚕️ ${patient.assignedDoctor?.name || 'No doctor assigned'}\n\n`;
        });
        
        response += `**AI Emergency Protocol:**\n`;
        response += `1. 🚑 Prioritize by criticality\n`;
        response += `2. 🏥 Assign specialists immediately\n`;
        response += `3. 📞 Notify emergency response team\n`;
        response += `4. 💊 Prepare emergency medications\n`;
        response += `5. 📊 Monitor vital signs continuously\n`;
        
        return response;
    };

    const processRecommendations = async (query) => {
        const lowerQuery = query.toLowerCase();
        let response = "💡 **AI Recommendations**\n\n";
        
        if (lowerQuery.includes('patient') && lowerQuery.includes('assign')) {
            response += `**Patient Assignment Strategy:**\n`;
            response += `• Match patient condition with doctor specialization\n`;
            response += `• Consider doctor current workload\n`;
            response += `• Prioritize critical cases for senior doctors\n`;
            response += `• Use geographic clustering for efficiency\n`;
        } else if (lowerQuery.includes('bed') || lowerQuery.includes('capacity')) {
            response += `**Bed Management Recommendations:**\n`;
            response += `• Implement dynamic bed allocation\n`;
            response += `• Create bed waiting list with priority scores\n`;
            response += `• Set up bed turnover protocols\n`;
            response += `• Use predictive analytics for bed demand\n`;
        } else if (lowerQuery.includes('staff') || lowerQuery.includes('schedule')) {
            response += `**Staff Optimization:**\n`;
            response += `• Implement shift-based patient handovers\n`;
            response += `• Create on-call rotation schedules\n`;
            response += `• Use workload balancing algorithms\n`;
            response += `• Track staff performance metrics\n`;
        } else {
            response += `**General Hospital Optimization:**\n`;
            response += `• Implement AI-powered triage system\n`;
            response += `• Use predictive analytics for resource planning\n`;
            response += `• Create automated patient flow management\n`;
            response += `• Develop real-time dashboard for decision making\n`;
            response += `• Implement quality metrics tracking\n`;
        }
        
        response += `\n**Next Steps:**\n`;
        response += `1. Review current bottlenecks\n`;
        response += `2. Implement priority-based systems\n`;
        response += `3. Monitor key performance indicators\n`;
        response += `4. Adjust based on real-time data\n`;
        
        return response;
    };

    const processTrendAnalysis = async (query) => {
        const { patients } = hospitalData;
        
        // Analyze trends in patient conditions
        const conditionCounts = {};
        patients.forEach(patient => {
            conditionCounts[patient.condition] = (conditionCounts[patient.condition] || 0) + 1;
        });
        
        const topConditions = Object.entries(conditionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        let response = "📈 **Hospital Trend Analysis**\n\n";
        response += `**Top 5 Conditions:**\n`;
        topConditions.forEach(([condition, count], index) => {
            const percentage = ((count / patients.length) * 100).toFixed(1);
            response += `${index + 1}. ${condition}: ${count} patients (${percentage}%)\n`;
        });
        
        response += `\n**Patient Demographics:**\n`;
        const ageGroups = {
            '0-18': patients.filter(p => p.age <= 18).length,
            '19-40': patients.filter(p => p.age > 18 && p.age <= 40).length,
            '41-60': patients.filter(p => p.age > 40 && p.age <= 60).length,
            '61+': patients.filter(p => p.age > 60).length
        };
        
        Object.entries(ageGroups).forEach(([group, count]) => {
            const percentage = ((count / patients.length) * 100).toFixed(1);
            response += `• ${group}: ${count} (${percentage}%)\n`;
        });
        
        response += `\n**AI Trend Insights:**\n`;
        if (topConditions[0] && topConditions[0][1] > patients.length * 0.3) {
            response += `• High prevalence of ${topConditions[0][0]}\n`;
            response += `• Consider specialized care unit\n`;
            response += `• Stock relevant medications\n`;
        }
        
        return response;
    };

    const generateSmartResponse = (query) => {
        // AI-powered response generation based on query context
        const responses = [
            "🤔 I understand you're asking about hospital operations. Try being more specific, like:\n• 'Analyze current patient load'\n• 'Suggest bed optimization'\n• 'Show doctor availability'\n• 'Emergency situation analysis'",
            
            "💭 Based on your query, I can help with:\n• **Patient Management**: 'Find patient details'\n• **Resource Planning**: 'Bed capacity analysis'\n• **Staff Allocation**: 'Doctor workload'\n• **Emergency Response**: 'Critical cases'\n\nWhat would you like to focus on?",
            
            "🧠 I'm detecting you might need decision support. Here are AI-powered options:\n• Predictive analytics for patient admissions\n• Optimization algorithms for resource allocation\n• Machine learning for treatment recommendations\n• Real-time monitoring and alerts\n\nWhich area interests you?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const getHelpMessage = () => {
        return `🤖 **Advanced Hospital AI Assistant - Commands**\n\n**Patient Intelligence:**\n• "Find patient [name]"\n• "Patient trends analysis"\n• "Critical patient list"\n• "Patient demographics"\n\n**Doctor Intelligence:**\n• "Doctor performance"\n• "Available doctors"\n• "Doctor specialization"\n• "Best doctor for [condition]"\n\n**Bed Intelligence:**\n• "Bed optimization"\n• "ICU bed status"\n• "Bed waiting times"\n• "Bed allocation strategy"\n\n**Analytics & AI:**\n• "Hospital analytics"\n• "Trend analysis"\n• "AI recommendations"\n• "Emergency analysis"\n• "Decision support"\n\n**Emergency & Alerts:**\n• "Emergency protocol"\n• "Critical alerts"\n• "Resource emergency"\n• "Priority patients"\n\nType any query for AI-powered insights!`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = { 
            text: inputMessage, 
            type: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');
        
        // Process with AI
        const response = await processAdvancedQuery(currentInput);
        
        // Add AI response
        setMessages(prev => [...prev, { 
            text: response, 
            type: 'bot',
            timestamp: new Date()
        }]);
    };

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
        setTimeout(() => {
            const fakeEvent = { preventDefault: () => {} };
            handleSendMessage(fakeEvent);
        }, 100);
    };

    const clearChat = () => {
        setMessages([{ 
            text: "🏥 **Advanced Hospital AI Assistant**\n\nReady to provide AI-powered insights, recommendations, and decision support.", 
            type: 'bot',
            timestamp: new Date()
        }]);
    };

    const exportChat = () => {
        const chatLog = messages.map(msg => 
            `${msg.type === 'bot' ? 'AI Assistant' : 'User'}: ${msg.text}\n`
        ).join('\n');
        
        const blob = new Blob([chatLog], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hospital-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'patients', label: 'Patients', path: '/dashboard/patients', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'beds', label: 'Bed Management', path: '/dashboard/beds', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
        { id: 'staff', label: 'Staff', path: '/dashboard/staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.25h-6m6 0V9.75m0 0a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v6.75' },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ id: 'admin', label: 'Admin Panel', path: '/dashboard/admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' });
    }

    const quickQuestions = [
        "Analyze patient trends",
        "Doctor performance",
        "Bed optimization",
        "Emergency analysis",
        "AI recommendations",
        "Hospital analytics"
    ];

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isChatbotOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [isChatbotOpen]);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`flex h-screen bg-gray-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
            <div className="flex flex-col w-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-xl font-bold text-white">HospitalAI</span>
                                    <div className="text-xs text-blue-400 flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                        AI Active
                                    </div>
                                </div>
                            </Link>
                        )}
                        {isCollapsed && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-400 hover:text-white transition-colors"
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                            </svg>
                        </button>
                    </div>
                    
                    {/* User Info */}
                    {!isCollapsed && user && (
                        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-white">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <div className="font-medium text-white">{user.name}</div>
                                    <div className="text-xs text-gray-400">{user.role}</div>
                                    <div className="text-xs text-blue-400 mt-1">
                                        AI Access: {['admin', 'doctor'].includes(user.role) ? 'Full' : 'Limited'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-2 overflow-y-auto">
                    {menuItems.map(item => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} space-x-3 p-3 rounded-lg mb-1 transition-all ${
                                location.pathname === item.path 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* AI Chatbot Section */}
                <div className="border-t border-gray-800">
                    {/* Chatbot Header */}
                    <div className={`p-3 ${alertLevel === 'critical' ? 'bg-red-900/20' : alertLevel === 'warning' ? 'bg-yellow-900/20' : 'bg-gray-800/20'}`}>
                        <button
                            onClick={toggleChatbot}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-colors`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isChatbotOpen ? 
                                    'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                    'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}>
                                    {isChatbotOpen ? (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <div className="relative">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="text-left">
                                        <div className="font-medium text-white">AI Assistant</div>
                                        <div className="text-xs text-gray-400">Advanced Decision Support</div>
                                        {aiInsights.length > 0 && (
                                            <div className="text-xs text-yellow-400 mt-1">
                                                ⚡ {aiInsights.length} active insights
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && isChatbotOpen && (
                                <div className="flex items-center space-x-2">
                                    {alertLevel === 'critical' && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isChatbotOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Chatbot Content */}
                    {isChatbotOpen && !isCollapsed && (
                        <div className="border-t border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
                            {/* Quick Questions */}
                            <div className="p-3 border-b border-gray-800">
                                <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
                                    <span>AI Quick Actions:</span>
                                    <button 
                                        onClick={exportChat}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                        title="Export chat"
                                    >
                                        Export
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {quickQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickQuestion(question)}
                                            className="text-xs bg-gray-800 text-gray-300 rounded-full px-2 py-1 hover:bg-gray-700 hover:text-white transition-all hover:scale-105"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* AI Insights Badge */}
                                {aiInsights.length > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded">
                                        <div className="text-xs text-yellow-300 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {aiInsights.length} AI Insights Active
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div className="h-64 overflow-y-auto p-3" style={{ maxHeight: '256px' }}>
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 animate-slideIn ${msg.type === 'user' ? 'text-right' : ''}`}
                                    >
                                        <div
                                            className={`inline-block max-w-[90%] p-3 rounded-lg text-sm ${
                                                msg.type === 'user'
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow'
                                                    : 'bg-gray-800/50 text-gray-300 rounded-bl-none border-l-2 border-blue-500'
                                            }`}
                                        >
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                            <div className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div className="mb-3">
                                        <div className="inline-block bg-gray-800 text-gray-300 p-3 rounded-lg rounded-bl-none border-l-2 border-green-500">
                                            <div className="flex items-center space-x-1">
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                                <span className="text-xs text-gray-400 ml-2">AI Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-3 border-t border-gray-800">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Ask AI for insights, recommendations..."
                                        className="flex-1 bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isTyping}
                                    />
                                    <div className="flex space-x-1">
                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || isTyping}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            title="Send to AI"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearChat}
                                            className="bg-gray-800 text-gray-400 p-2 rounded-lg hover:bg-gray-700 hover:text-gray-300 transition-colors"
                                            title="Clear chat"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                                <div className="text-xs text-gray-500 mt-2 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    AI can analyze data, provide recommendations, and detect patterns
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center w-full'} space-x-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors`}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Animation CSS */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease;
                }
                
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #10b981;
                    border-radius: 50%;
                    display: inline-block;
                    animation: typing 1.4s infinite ease-in-out;
                }
                .typing-dot:nth-child(1) {
                    animation-delay: -0.32s;
                }
                .typing-dot:nth-child(2) {
                    animation-delay: -0.16s;
                }
                @keyframes typing {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                /* Gradient border effect */
                .gradient-border {
                    position: relative;
                }
                .gradient-border::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981, #f59e0b);
                    border-radius: inherit;
                    z-index: -1;
                    animation: rotate 3s linear infinite;
                }
                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Sidebar;