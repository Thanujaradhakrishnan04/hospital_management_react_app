import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api/axiosConfig';


const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        patients: 0,
        availableBeds: 0,
        occupiedBeds: 0,
        staff: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

   const fetchDashboardData = async () => {
    try {
        const [patientsRes, bedsRes, staffRes] = await Promise.all([
            api.get('/api/patients'),
            api.get('/api/beds/stats'),
            api.get('/api/staff/stats')
        ]);

        setStats({
            patients: patientsRes.data.length,
            availableBeds: bedsRes.data.available,
            occupiedBeds: bedsRes.data.occupied,
            staff: staffRes.data.byRole?.reduce((sum, role) => sum + role.count, 0) || 0
        });

        setRecentPatients(patientsRes.data.slice(0, 5));
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
};
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {getGreeting()}, {user?.name}!
                </h1>
                <p className="text-gray-600">
                    Welcome to Hospital Management System. Here's what's happening today.
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Patients</p>
                            <p className="text-2xl font-bold">{stats.patients}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Available Beds</p>
                            <p className="text-2xl font-bold text-green-600">{stats.availableBeds}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Occupied Beds</p>
                            <p className="text-2xl font-bold text-red-600">{stats.occupiedBeds}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.25h-6m6 0V9.75m0 0a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v6.75" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Staff Members</p>
                            <p className="text-2xl font-bold">{stats.staff}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Patients and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">Recent Patients</h3>
                    </div>
                    <div className="p-6">
                        {recentPatients.length === 0 ? (
                            <p className="text-gray-500 text-center">No patients yet</p>
                        ) : (
                            <div className="space-y-4">
                                {recentPatients.map(patient => (
                                    <div key={patient._id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{patient.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {patient.age} years • {patient.gender}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">Room {patient.roomNumber}</div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${patient.emergencyLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {patient.condition}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">Recent Alerts</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                                <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="font-medium">Bed Occupancy High</p>
                                    <p className="text-sm text-gray-600">ICU beds are 85% occupied</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium">System Update</p>
                                    <p className="text-sm text-gray-600">New features added to patient management</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-3 border-l-4 border-green-400 bg-green-50 rounded">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium">Staff Meeting</p>
                                    <p className="text-sm text-gray-600">Monthly meeting scheduled for tomorrow at 10 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition">
                            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm font-medium">Add Patient</span>
                        </button>
                        
                        <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition">
                            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm font-medium">View Reports</span>
                        </button>
                        
                        <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition">
                            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium">Staff Schedule</span>
                        </button>
                        
                        <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition">
                            <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="text-sm font-medium">Emergency</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;