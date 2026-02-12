import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig'; 
const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/api/beds');
            setBeds(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error('Error fetching beds:', error);
            // Fallback to local data if API fails
            initializeLocalBeds();
        } finally {
            setLoading(false);
        }
    };

    const initializeLocalBeds = () => {
        // Only initialize if we have no beds (first time)
        const initialBeds = [];
        const bedTypes = ['general', 'icu', 'emergency', 'isolation', 'step-down'];
        const departments = ['Emergency', 'ICU', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'];

        for (let i = 1; i <= 50; i++) {
            // Initially ALL beds should be available, not random
            initialBeds.push({
                _id: `bed-${i}`,
                bedNumber: `B${i.toString().padStart(3, '0')}`,
                roomNumber: `R${Math.floor((i-1)/4) + 100}`, // 4 beds per room
                type: bedTypes[Math.floor(Math.random() * bedTypes.length)],
                status: 'available', // ALL beds start as available
                department: departments[Math.floor(Math.random() * departments.length)],
                patientId: null,
                patientName: null
            });
        }

        setBeds(initialBeds);
        calculateStats(initialBeds);
    };

    const calculateStats = (bedsData) => {
        const stats = {
            total: bedsData.length,
            available: bedsData.filter(b => b.status === 'available').length,
            occupied: bedsData.filter(b => b.status === 'occupied').length,
            maintenance: bedsData.filter(b => b.status === 'maintenance').length
        };
        setStats(stats);
    };

    const handleBedStatusChange = async (bedId, newStatus) => {
    try {
        await api.put(`/api/beds/${bedId}`, { status: newStatus });
        
        const updatedBeds = beds.map(bed => 
            bed._id === bedId ? { ...bed, status: newStatus } : bed
        );
        setBeds(updatedBeds);
        calculateStats(updatedBeds);
        
    } catch (error) {
        console.error('Error updating bed status:', error);
        alert('Failed to update bed status');
    }
};

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'occupied': return 'bg-red-500';
            case 'maintenance': return 'bg-yellow-500';
            case 'reserved': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'available': return 'text-green-700';
            case 'occupied': return 'text-red-700';
            case 'maintenance': return 'text-yellow-700';
            case 'reserved': return 'text-blue-700';
            default: return 'text-gray-700';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'icu': return 'border-red-300 bg-red-50';
            case 'emergency': return 'border-orange-300 bg-orange-50';
            case 'isolation': return 'border-purple-300 bg-purple-50';
            case 'step-down': return 'border-blue-300 bg-blue-50';
            case 'pediatric': return 'border-pink-300 bg-pink-50';
            case 'maternity': return 'border-indigo-300 bg-indigo-50';
            default: return 'border-green-300 bg-green-50';
        }
    };

    const getTypeDisplayName = (type) => {
        const typeMap = {
            'general': 'General',
            'icu': 'ICU',
            'emergency': 'Emergency',
            'isolation': 'Isolation',
            'step-down': 'Step-down',
            'pediatric': 'Pediatric',
            'maternity': 'Maternity'
        };
        return typeMap[type] || type;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading bed data...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Bed Availability Dashboard</h2>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Beds</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Occupied</p>
                                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Maintenance</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend and Controls */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm">Available</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm">Occupied</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-sm">Maintenance</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                        <span className="text-sm">Reserved</span>
                    </div>
                    
                    <div className="ml-auto">
                        <button 
                            onClick={fetchBeds}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Beds Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {beds.map(bed => (
                    <div
                        key={bed._id}
                        className={`relative p-3 rounded-lg shadow-sm border-2 ${getTypeColor(bed.type)} transition-transform hover:scale-105`}
                    >
                        <div className="absolute top-2 right-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(bed.status)}`}></div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{bed.bedNumber}</div>
                            <div className="text-xs text-gray-600 mt-1">{bed.roomNumber}</div>
                            <div className="text-xs font-semibold mt-1 px-2 py-1 rounded-full bg-white">
                                {getTypeDisplayName(bed.type)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{bed.department}</div>
                            
                            <div className={`mt-2 p-2 rounded border ${getStatusColor(bed.status)} bg-opacity-20`}>
                                <div className={`text-xs font-medium ${getStatusTextColor(bed.status)}`}>
                                    {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                                </div>
                                
                                {bed.status === 'occupied' && bed.patientId && (
                                    <div className="text-xs text-red-600 truncate">
                                        {bed.patientId.name || 'Patient'}
                                    </div>
                                )}
                            </div>

                            {/* Status Change Buttons */}
                            <div className="mt-2 grid grid-cols-2 gap-1">
                                {bed.status !== 'available' && (
                                    <button
                                        onClick={() => handleBedStatusChange(bed._id, 'available')}
                                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                        Free
                                    </button>
                                )}
                                
                                {bed.status !== 'occupied' && (
                                    <button
                                        onClick={() => handleBedStatusChange(bed._id, 'occupied')}
                                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Occupy
                                    </button>
                                )}
                                
                                {bed.status !== 'maintenance' && (
                                    <button
                                        onClick={() => handleBedStatusChange(bed._id, 'maintenance')}
                                        className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                    >
                                        Repair
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bed Types Summary */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Bed Types Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {['general', 'icu', 'emergency', 'isolation', 'step-down', 'pediatric', 'maternity'].map(type => {
                        const count = beds.filter(b => b.type === type).length;
                        const available = beds.filter(b => b.type === type && b.status === 'available').length;
                        
                        return (
                            <div key={type} className="text-center p-4 border rounded-lg bg-opacity-20" style={{
                                borderColor: getStatusColor(type),
                                backgroundColor: `${getStatusColor(type)}20`
                            }}>
                                <div className="text-2xl font-bold" style={{ color: getStatusColor(type).replace('bg-', 'text-') }}>
                                    {count}
                                </div>
                                <div className="text-sm" style={{ color: getStatusColor(type).replace('bg-', 'text-') }}>
                                    {getTypeDisplayName(type)}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {available} available
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Department Summary */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Beds by Department</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Array.from(new Set(beds.map(b => b.department))).map(dept => {
                        const deptBeds = beds.filter(b => b.department === dept);
                        const available = deptBeds.filter(b => b.status === 'available').length;
                        
                        return (
                            <div key={dept} className="text-center p-3 border border-gray-300 rounded-lg bg-gray-50">
                                <div className="text-lg font-bold text-gray-800">{deptBeds.length}</div>
                                <div className="text-sm text-gray-700">{dept}</div>
                                <div className="text-xs text-green-600 mt-1">
                                    {available} available
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => {
                            // Set all beds to available
                            if (window.confirm('Set all beds to available status?')) {
                                const updatedBeds = beds.map(bed => ({ ...bed, status: 'available' }));
                                setBeds(updatedBeds);
                                calculateStats(updatedBeds);
                                // In real app, you would make API calls for each bed
                            }
                        }}
                        className="p-4 border border-green-300 rounded-lg bg-green-50 hover:bg-green-100 text-green-700"
                    >
                        <div className="font-medium">Mark All Available</div>
                        <div className="text-sm">Set all beds to available status</div>
                    </button>
                    
                    <button 
                        onClick={() => {
                            // Export bed data
                            const dataStr = JSON.stringify(beds, null, 2);
                            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                            const exportFileDefaultName = 'bed-status.json';
                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            linkElement.click();
                        }}
                        className="p-4 border border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                    >
                        <div className="font-medium">Export Data</div>
                        <div className="text-sm">Download current bed status</div>
                    </button>
                    
                    <button 
                        onClick={() => {
                            // Print bed status
                            window.print();
                        }}
                        className="p-4 border border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700"
                    >
                        <div className="font-medium">Print Report</div>
                        <div className="text-sm">Print bed availability report</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BedManagement;