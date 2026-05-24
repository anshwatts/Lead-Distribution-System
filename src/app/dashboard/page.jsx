'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setProviders(data);
        setError(null);
      } catch (err) {
        setError('Error connecting to backend dashboard endpoint.');
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Live Provider Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">{provider.name}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                ID: {provider.id}
              </span>
            </div>
            
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Remaining Quota</span>
                <span className={`font-bold ${provider.remaining_quota === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {provider.remaining_quota}
                </span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-500">Total Leads Received</span>
                <span className="font-semibold text-gray-800">{provider.leads_received} / {provider.max_quota}</span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Assigned Leads</h4>
                {provider.leads.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No leads assigned yet.</p>
                ) : (
                  <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {provider.leads.map((lead, idx) => (
                      <li key={idx} className="text-sm bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="font-medium text-gray-800">{lead.name}</div>
                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                          <span>{lead.phone}</span>
                          <span className="text-blue-600">Svc {lead.service_type}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
