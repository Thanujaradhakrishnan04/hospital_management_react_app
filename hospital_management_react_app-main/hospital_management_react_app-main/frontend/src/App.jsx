import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';

import Login from './Components/Auth/Login';
import Signup from './Components/Auth/Signup';
import Dashboard from './Components/Dashboard/Dashboard';
import PrivateRoute from './Components/Auth/PrivateRoute';


function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route 
                            path="/dashboard/*" 
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
