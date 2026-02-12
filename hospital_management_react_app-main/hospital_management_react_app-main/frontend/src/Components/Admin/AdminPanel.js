import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosConfig';

const AdminPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('approvals');

    useEffect(() => {
        if (activeTab === 'approvals') {
            fetchPendingUsers();
        } else {
            fetchAllUsers();
        }
    }, [activeTab]);

    const fetchPendingUsers = async () => {
    try {
        const res = await api.get('/api/auth/pending');
        setPendingUsers(res.data);
    } catch (error) {
        console.error('Error fetching pending users:', error);
    }
};

   const fetchAllUsers = async () => {
    try {
        const res = await api.get('/api/staff');
        setAllUsers(res.data);
    } catch (error) {
        console.error('Error fetching all users:', error);
    }
};

    const handleApprove = async (userId) => {
    try {
        await api.put(`/api/auth/approve/${userId}`, {});
        fetchPendingUsers();
    } catch (error) {
        console.error('Error approving user:', error);
    }
};

    const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
        try {
            await api.delete(`/api/staff/${userId}`);
            fetchAllUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
};

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'approvals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Pending Approvals ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        All Users ({allUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Analytics
                    </button>
                </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'approvals' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">Pending User Approvals</h3>
                    </div>
                    {pendingUsers.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No pending approvals
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {pendingUsers.map(user => (
                                <div key={user._id} className="p-6 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.role}
                                            </span>
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {user.department}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">All Users</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allUsers.map(user => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Total Users</span>
                                <span className="font-bold">{allUsers.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Pending Approvals</span>
                                <span className="font-bold text-yellow-600">{pendingUsers.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                                Generate Monthly Report
                            </button>
                            <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                                Send System Notification
                            </button>
                            <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                                Backup Database
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;