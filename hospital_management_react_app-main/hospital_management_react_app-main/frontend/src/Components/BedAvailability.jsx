import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BedAvailability = () => {
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await axios.get('/api/beds');
        setBeds(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBeds();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bed Availability</h2>
      <div className="grid grid-cols-10 gap-4">
        {beds.map((bed) => (
          <div
            key={bed._id}
            className={`p-4 rounded-lg text-center ${
              bed.status === 'available'
                ? 'bg-green-500'
                : bed.status === 'occupied'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          >
            <div className="text-white font-bold">{bed.bedNumber}</div>
            <div className="text-white text-sm">{bed.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedAvailability;