import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosConfig';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [availableNurses, setAvailableNurses] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStaff();
        fetchAvailableStaff();
        fetchStats();
    }, []);

    const fetchStaff = async () => {
    try {
        const res = await api.get('/api/staff');
        setStaff(res.data);
    } catch (error) {
        console.error('Error fetching staff:', error);
    }
};

   const fetchAvailableStaff = async () => {
    try {
        const [doctorsRes, nursesRes] = await Promise.all([
            api.get('/api/staff/available/doctor'),
            api.get('/api/staff/available/nurse')
        ]);
        setAvailableDoctors(doctorsRes.data);
        setAvailableNurses(nursesRes.data);
    } catch (error) {
        console.error('Error fetching available staff:', error);
    }
};;

    const fetchStats = async () => {
    try {
        const res = await api.get('/api/staff/stats');
        setStats(res.data);
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
};

    const getRoleColor = (role) => {
        switch (role) {
            case 'doctor': return 'bg-blue-100 text-blue-800';
            case 'nurse': return 'bg-green-100 text-green-800';
            case 'technician': return 'bg-purple-100 text-purple-800';
            case 'pharmacist': return 'bg-yellow-100 text-yellow-800';
            case 'janitor': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (isApproved) => {
        return isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Management</h2>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.byRole?.map(stat => (
                        <div key={stat._id} className="bg-white p-4 rounded-lg shadow">
                            <div className="text-2xl font-bold text-gray-800">{stat.count}</div>
                            <div className="text-sm text-gray-600">{stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}</div>
                            <div className="text-xs text-green-600 mt-1">{stat.available} available</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Doctors */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Available Doctors ({availableDoctors.length})
                    </h3>
                    <div className="space-y-3">
                        {availableDoctors.map(doctor => (
                            <div key={doctor._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-sm text-gray-600">{doctor.specialization || 'General'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{doctor.department}</div>
                                    <div className="text-xs text-gray-500">{doctor.contact}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Nurses */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.25h-6m6 0V9.75m0 0a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v6.75" />
                        </svg>
                        Available Nurses ({availableNurses.length})
                    </h3>
                    <div className="space-y-3">
                        {availableNurses.map(nurse => (
                            <div key={nurse._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{nurse.name}</div>
                                    <div className="text-sm text-gray-600">Nurse</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{nurse.department}</div>
                                    <div className="text-xs text-gray-500">{nurse.contact}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* All Staff Table */}
            <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">All Staff Members</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map(member => (
                            <tr key={member._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                    <div className="text-sm text-gray-500">{member.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(member.role)}`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.contact}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.isApproved)}`}>
                                        {member.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.shift || 'General'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffManagement;