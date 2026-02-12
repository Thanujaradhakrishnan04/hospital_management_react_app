import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Hospital Assistant. How can I help you today? You can ask about patients, beds, staff, or any hospital information.", type: 'bot' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = { text: inputMessage, type: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Process the query
            const response = await processQuery(inputMessage);
            
            // Add bot response
            setTimeout(() => {
                setMessages(prev => [...prev, { text: response, type: 'bot' }]);
                setIsTyping(false);
            }, 500);
        } catch (error) {
            console.error('Error processing query:', error);
            setMessages(prev => [...prev, { 
                text: "Sorry, I encountered an error. Please try again.", 
                type: 'bot' 
            }]);
            setIsTyping(false);
        }
    };

    const processQuery = async (query) => {
        const lowerQuery = query.toLowerCase();

        try {
            // Patient-related queries
            if (lowerQuery.includes('patient') || lowerQuery.includes('patients')) {
                const patientsRes = await api.get('/api/patients');
                const patients = patientsRes.data;

                if (lowerQuery.includes('how many')) {
                    const admitted = patients.filter(p => p.status === 'admitted').length;
                    const discharged = patients.filter(p => p.status === 'discharged').length;
                    return `Currently, there are ${admitted} admitted patients and ${discharged} discharged patients. Total: ${patients.length} patients.`;
                }

                if (lowerQuery.includes('list') || lowerQuery.includes('all')) {
                    if (patients.length === 0) return "No patients found.";
                    let response = "Here are the current patients:\n";
                    patients.slice(0, 5).forEach((p, i) => {
                        response += `${i + 1}. ${p.name} (${p.age}y, ${p.condition}) - Room: ${p.roomNumber}\n`;
                    });
                    if (patients.length > 5) response += `\n...and ${patients.length - 5} more patients.`;
                    return response;
                }

                // Search for specific patient
                const nameMatch = query.match(/patient\s+([a-zA-Z\s]+)/i) || 
                                 query.match(/details\s+of\s+([a-zA-Z\s]+)/i);
                if (nameMatch) {
                    const searchName = nameMatch[1].trim();
                    const patient = patients.find(p => 
                        p.name.toLowerCase().includes(searchName.toLowerCase())
                    );
                    if (patient) {
                        return `Patient Details:\nName: ${patient.name}\nAge: ${patient.age}\nGender: ${patient.gender}\nCondition: ${patient.condition}\nRoom: ${patient.roomNumber}\nStatus: ${patient.status}\nEmergency Level: ${patient.emergencyLevel}`;
                    } else {
                        return `No patient found with name containing "${searchName}".`;
                    }
                }

                return `I found ${patients.length} patients. You can ask about a specific patient by name, or ask "How many patients are there?"`;
            }

            // Bed-related queries
            if (lowerQuery.includes('bed') || lowerQuery.includes('beds')) {
                const bedsRes = await api.get('/api/beds/stats');
                const stats = bedsRes.data;

                if (lowerQuery.includes('available') || lowerQuery.includes('vacant')) {
                    return `There are ${stats.available} available beds out of ${stats.total} total beds.`;
                }

                if (lowerQuery.includes('occupied')) {
                    return `Currently ${stats.occupied} beds are occupied.`;
                }

                if (lowerQuery.includes('icu') || lowerQuery.includes('intensive care')) {
                    const icuBeds = stats.byType?.find(b => b._id === 'icu');
                    if (icuBeds) {
                        return `ICU Beds: ${icuBeds.count} total, ${icuBeds.available} available.`;
                    }
                    return "ICU bed information is not available.";
                }

                return `Bed Status:\n- Total: ${stats.total}\n- Available: ${stats.available}\n- Occupied: ${stats.occupied}\n- Maintenance: ${stats.maintenance}`;
            }

            // Staff-related queries
            if (lowerQuery.includes('staff') || lowerQuery.includes('doctor') || lowerQuery.includes('nurse')) {
                const staffRes = await api.get('/api/staff/stats');
                const stats = staffRes.data;

                if (lowerQuery.includes('doctor')) {
                    const doctors = stats.byRole?.find(s => s._id === 'doctor');
                    if (doctors) {
                        return `Doctors: ${doctors.count} total, ${doctors.available} available.`;
                    }
                }

                if (lowerQuery.includes('nurse')) {
                    const nurses = stats.byRole?.find(s => s._id === 'nurse');
                    if (nurses) {
                        return `Nurses: ${nurses.count} total, ${nurses.available} available.`;
                    }
                }

                if (lowerQuery.includes('how many')) {
                    const totalStaff = stats.byRole?.reduce((sum, role) => sum + role.count, 0) || 0;
                    return `There are ${totalStaff} staff members in the hospital.`;
                }

                let response = "Staff Statistics:\n";
                stats.byRole?.forEach(role => {
                    response += `- ${role._id}: ${role.count} (${role.available} available)\n`;
                });
                return response;
            }

            // General hospital status
            if (lowerQuery.includes('status') || lowerQuery.includes('overview') || lowerQuery.includes('summary')) {
                const [patientsRes, bedsRes, staffRes] = await Promise.all([
                    api.get('/api/patients'),
                    api.get('/api/beds/stats'),
                    api.get('/api/staff/stats')
                ]);

                const patientCount = patientsRes.data.length;
                const availableBeds = bedsRes.data.available;
                const occupiedBeds = bedsRes.data.occupied;
                const totalStaff = staffRes.data.byRole?.reduce((sum, role) => sum + role.count, 0) || 0;

                return `Hospital Overview:\n- Patients: ${patientCount}\n- Available Beds: ${availableBeds}\n- Occupied Beds: ${occupiedBeds}\n- Staff: ${totalStaff}\n- Bed Occupancy Rate: ${Math.round((occupiedBeds / (availableBeds + occupiedBeds)) * 100)}%`;
            }

            // Emergency/critical patients
            if (lowerQuery.includes('emergency') || lowerQuery.includes('critical')) {
                const patientsRes = await api.get('/api/patients');
                const criticalPatients = patientsRes.data.filter(p => 
                    p.emergencyLevel === 'critical' || p.emergencyLevel === 'high'
                );

                if (criticalPatients.length === 0) {
                    return "No critical or high emergency patients at the moment.";
                }

                let response = `Critical/High Emergency Patients (${criticalPatients.length}):\n`;
                criticalPatients.forEach((p, i) => {
                    response += `${i + 1}. ${p.name} - ${p.condition} - Room: ${p.roomNumber}\n`;
                });
                return response;
            }

            // Department-specific queries
            if (lowerQuery.includes('department') || 
                lowerQuery.includes('icu') || 
                lowerQuery.includes('emergency') ||
                lowerQuery.includes('cardiology') ||
                lowerQuery.includes('neurology')) {
                
                const deptMatch = query.match(/department\s+([a-zA-Z\s]+)/i);
                let department = '';
                
                if (lowerQuery.includes('icu')) department = 'ICU';
                else if (lowerQuery.includes('emergency')) department = 'Emergency';
                else if (lowerQuery.includes('cardiology')) department = 'Cardiology';
                else if (lowerQuery.includes('neurology')) department = 'Neurology';
                else if (deptMatch) department = deptMatch[1].trim();
                
                if (department) {
                    const [patientsRes, bedsRes] = await Promise.all([
                        api.get('/api/patients'),
                        api.get('/api/beds')
                    ]);
                    
                    const deptPatients = patientsRes.data.filter(p => 
                        p.department?.toLowerCase().includes(department.toLowerCase())
                    );
                    const deptBeds = bedsRes.data.filter(b => 
                        b.department.toLowerCase().includes(department.toLowerCase())
                    );
                    const availableDeptBeds = deptBeds.filter(b => b.status === 'available').length;
                    
                    return `${department} Department:\n- Patients: ${deptPatients.length}\n- Total Beds: ${deptBeds.length}\n- Available Beds: ${availableDeptBeds}`;
                }
            }

            // Help or examples
            if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
                return `I can help you with:\n1. Patient information and status\n2. Bed availability and occupancy\n3. Staff details and availability\n4. Department-wise statistics\n5. Emergency/critical cases\n6. Hospital overview\n\nExamples:\n- "How many patients are there?"\n- "Show bed status"\n- "Tell me about patient John"\n- "How many doctors are available?"\n- "Give me hospital overview"`;
            }

            // Greetings
            if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
                return "Hello! How can I assist you with hospital information today?";
            }

            // Default response for unrecognized queries
            return "I'm not sure I understand. Try asking about patients, beds, staff, or hospital status. Type 'help' for examples.";

        } catch (error) {
            console.error('Error in processQuery:', error);
            return "Sorry, I'm having trouble accessing the data. Please make sure you're logged in and try again.";
        }
    };

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
    };

    // Quick questions suggestions
    const quickQuestions = [
        "How many patients?",
        "Bed availability?",
        "Show critical patients",
        "Staff count?",
        "Hospital overview"
    ];

    return (
        <>
            {/* Chatbot Toggle Button */}
            <button
                onClick={handleToggleChat}
                className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                aria-label="Chatbot"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl z-40 flex flex-col border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">Hospital Assistant</h3>
                                <p className="text-xs opacity-80">Ask me anything about the hospital</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleChat}
                            className="text-white hover:text-gray-200"
                            aria-label="Close chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Quick Questions */}
                    <div className="p-3 bg-gray-50 border-b">
                        <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickQuestion(question)}
                                    className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 transition"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-3 ${msg.type === 'user' ? 'text-right' : ''}`}
                            >
                                <div
                                    className={`inline-block max-w-[80%] p-3 rounded-lg ${msg.type === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                    <div className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {msg.type === 'bot' ? 'Hospital Assistant' : 'You'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="mb-3">
                                <div className="inline-block bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                                    <div className="flex items-center">
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="border-t p-3">
                        <div className="flex">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask about patients, beds, staff..."
                                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Ask about patients, bed status, staff availability, or department info
                        </p>
                    </form>
                </div>
            )}

            <style jsx>{`
                .typing-dots {
                    display: flex;
                    align-items: center;
                    height: 17px;
                }
                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    margin: 0 1px;
                    background-color: #9ca3af;
                    border-radius: 50%;
                    display: block;
                    opacity: 0.4;
                }
                .typing-dots span:nth-child(1) {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .typing-dots span:nth-child(2) {
                    animation: pulse 1.5s infinite ease-in-out 0.2s;
                }
                .typing-dots span:nth-child(3) {
                    animation: pulse 1.5s infinite ease-in-out 0.4s;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default Chatbot;