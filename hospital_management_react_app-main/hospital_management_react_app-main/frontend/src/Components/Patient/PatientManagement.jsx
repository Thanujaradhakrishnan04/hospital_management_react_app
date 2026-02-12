import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosConfig';
const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        contact: '',
        emergencyContact: '',
        address: '',
        bloodGroup: '',
        roomNumber: '',
        bedId: '',
        emergencyLevel: 'low',
        condition: '',
        symptoms: '',
        assignedDoctor: '',
        assignedNurse: '',
        insurance: {
            provider: '',
            policyNumber: '',
            coverage: 0
        }
    });

    useEffect(() => {
        fetchPatients();
        fetchAvailableBeds();
        fetchDoctorsAndNurses();
    }, []);

    const fetchPatients = async () => {
    try {
        const res = await api.get('/api/patients');
        setPatients(res.data);
    } catch (error) {
        console.error('Error fetching patients:', error);
    }
};

    const fetchAvailableBeds = async () => {
    try {
        const res = await api.get('/api/beds');
        const available = res.data.filter(bed => bed.status === 'available');
        setAvailableBeds(available);
    } catch (error) {
        console.error('Error fetching beds:', error);
    }
};

    const fetchDoctorsAndNurses = async () => {
    try {
        const [doctorsRes, nursesRes] = await Promise.all([
            api.get('/api/staff/available/doctor'),
            api.get('/api/staff/available/nurse')
        ]);
        setDoctors(doctorsRes.data);
        setNurses(nursesRes.data);
    } catch (error) {
        console.error('Error fetching staff:', error);
    }
};

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('insurance.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                insurance: {
                    ...formData.insurance,
                    [field]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleBedSelect = (bedId) => {
        const selectedBed = availableBeds.find(bed => bed._id === bedId);
        if (selectedBed) {
            setFormData({
                ...formData,
                bedId: bedId,
                roomNumber: selectedBed.roomNumber,
                department: selectedBed.department
            });
        }
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const patientData = {
            ...formData,
            age: parseInt(formData.age),
            symptoms: formData.symptoms.split(',').map(s => s.trim())
        };

        const res = await api.post('/api/patients', patientData);

        if (res.status === 201) {
            alert('Patient admitted successfully!');
            setShowForm(false);
            setFormData({
                name: '',
                age: '',
                gender: 'male',
                contact: '',
                emergencyContact: '',
                address: '',
                bloodGroup: '',
                roomNumber: '',
                bedId: '',
                emergencyLevel: 'low',
                condition: '',
                symptoms: '',
                assignedDoctor: '',
                assignedNurse: '',
                insurance: {
                    provider: '',
                    policyNumber: '',
                    coverage: 0
                }
            });
            fetchPatients();
            fetchAvailableBeds();
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        alert(error.response?.data?.message || 'Failed to admit patient');
    } finally {
        setLoading(false);
    }
};

    const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
        try {
            await api.delete(`/api/patients/${id}`);
            fetchPatients();
            fetchAvailableBeds();
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Failed to delete patient');
        }
    }
};

    const handleDischarge = async (id) => {
    if (window.confirm('Are you sure you want to discharge this patient?')) {
        try {
            await api.post(`/api/patients/${id}/discharge`, {});
            fetchPatients();
            fetchAvailableBeds();
        } catch (error) {
            console.error('Error discharging patient:', error);
            alert('Failed to discharge patient');
        }
    }
};

    const conditions = [
        'Stroke', 'Heart Attack', 'Pneumonia', 'COVID-19', 'Diabetes',
        'Hypertension', 'Fracture', 'Appendicitis', 'Migraine', 'Asthma',
        'Cancer', 'Kidney Failure', 'Liver Disease', 'Sepsis', 'Trauma'
    ];

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const getEmergencyColor = (level) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'admitted': return 'bg-blue-100 text-blue-800';
            case 'discharged': return 'bg-gray-100 text-gray-800';
            case 'transferred': return 'bg-purple-100 text-purple-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    {showForm ? 'Cancel' : '+ Admit Patient'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold mb-4">Admit New Patient</h3>
                    
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Available Beds: {availableBeds.length}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {availableBeds.map(bed => (
                                <button
                                    key={bed._id}
                                    type="button"
                                    onClick={() => handleBedSelect(bed._id)}
                                    className={`p-2 rounded border ${formData.bedId === bed._id ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
                                >
                                    <div className="font-medium">{bed.bedNumber}</div>
                                    <div className="text-sm text-gray-600">{bed.roomNumber}</div>
                                    <div className="text-xs">{bed.type} • {bed.department}</div>
                                </button>
                            ))}
                        </div>
                        {availableBeds.length === 0 && (
                            <p className="text-red-600">No available beds. Please check bed management.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Personal Information</h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age *</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                        min="0"
                                        max="120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {bloodGroups.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                    <input
                                        type="tel"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Medical Information</h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Condition *</label>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    >
                                        <option value="">Select Condition</option>
                                        {conditions.map(cond => (
                                            <option key={cond} value={cond}>{cond}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                                    <input
                                        type="text"
                                        name="symptoms"
                                        value={formData.symptoms}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Fever, Cough, Headache (separate with commas)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Emergency Level *</label>
                                    <select
                                        name="emergencyLevel"
                                        value={formData.emergencyLevel}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign Doctor</label>
                                    <select
                                        name="assignedDoctor"
                                        value={formData.assignedDoctor}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor._id} value={doctor._id}>
                                                Dr. {doctor.name} ({doctor.specialization || 'General'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign Nurse</label>
                                    <select
                                        name="assignedNurse"
                                        value={formData.assignedNurse}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Select Nurse</option>
                                        {nurses.map(nurse => (
                                            <option key={nurse._id} value={nurse._id}>
                                                Nurse {nurse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Selected Bed</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {formData.bedId ? (
                                            <div>
                                                <span className="font-medium">
                                                    {availableBeds.find(b => b._id === formData.bedId)?.bedNumber || 'N/A'}
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    Room: {formData.roomNumber}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">No bed selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Insurance Information */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Insurance Information (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                                    <input
                                        type="text"
                                        name="insurance.provider"
                                        value={formData.insurance.provider}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                                    <input
                                        type="text"
                                        name="insurance.policyNumber"
                                        value={formData.insurance.policyNumber}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coverage Amount</label>
                                    <input
                                        type="number"
                                        name="insurance.coverage"
                                        value={formData.insurance.coverage}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                disabled={loading || !formData.bedId}
                            >
                                {loading ? 'Admitting...' : 'Admit Patient'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Patients List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Patients ({patients.length})</h3>
                        <span className="text-sm text-gray-600">
                            Showing {patients.length} patients
                        </span>
                    </div>
                </div>
                
                {patients.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No patients found. Admit your first patient.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room/Bed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patients.map(patient => (
                                    <tr key={patient._id}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{patient.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {patient.age}y • {patient.gender} • {patient.bloodGroup || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-400">{patient.contact}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium">
                                                Room {patient.roomNumber}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Bed: {patient.bedId?.bedNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{patient.condition}</div>
                                            {patient.symptoms && patient.symptoms.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {patient.symptoms.slice(0, 2).join(', ')}
                                                    {patient.symptoms.length > 2 && '...'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEmergencyColor(patient.emergencyLevel)}`}>
                                                {patient.emergencyLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(patient.admissionDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            {patient.status === 'admitted' && (
                                                <button
                                                    onClick={() => handleDischarge(patient._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Discharge
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(patient._id)}
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
            </div>
        </div>
    );
};

export default PatientManagement;