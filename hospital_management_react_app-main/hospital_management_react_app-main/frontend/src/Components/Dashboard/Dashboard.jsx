import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import PatientManagement from '../Patient/PatientManagement';
import BedManagement from '../../Beds/BedManagement'; // Fixed path
import StaffManagement from '../Staff/StaffManagement';
import AdminPanel from '../Admin/AdminPanel';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} />
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="patients" element={<PatientManagement />} />
                        <Route path="beds" element={<BedManagement />} />
                        <Route path="staff" element={<StaffManagement />} />
                        {user?.role === 'admin' && (
                            <Route path="admin" element={<AdminPanel />} />
                        )}
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;