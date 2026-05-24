'use client';

import { useState } from 'react';

export default function TestTools() {
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleResetQuota = async () => {
    addLog('Testing: Reset Provider Quota via Webhook');
    try {
      const response = await fetch('/api/webhook/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId: `test-uuid-${Date.now()}`,
          providerId: 1
        })
      });
      const data = await response.json();
      addLog(`Result: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
    }
  };

  const handleTestIdempotency = async () => {
    addLog('Testing: Webhook Idempotency (3 parallel requests with same UUID)');
    const fixedUuid = `idemp-test-${Date.now()}`;
    
    const requests = Array.from({ length: 3 }).map((_, i) => {
      addLog(`Firing duplicate request ${i + 1}`);
      return fetch('/api/webhook/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId: fixedUuid,
          providerId: 2
        })
      }).then(res => res.json());
    });

    try {
      const results = await Promise.all(requests);
      results.forEach((res, i) => {
        addLog(`Response ${i + 1}: ${JSON.stringify(res)}`);
      });
    } catch (err) {
      addLog(`Error during idempotency test: ${err.message}`);
    }
  };

  const handleSimulateConcurrency = async () => {
    addLog('Testing: Concurrency (10 Instant Leads)');
    
    const requests = Array.from({ length: 10 }).map((_, i) => {
      const randomPhone = `555${Math.floor(1000000 + Math.random() * 9000000)}`;
      return fetch('/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Concurrent User ${i + 1}`,
          phone: randomPhone,
          city: 'Test City',
          serviceType: '1',
          description: 'Concurrency Test'
        })
      }).then(res => res.json());
    });

    try {
      const results = await Promise.all(requests);
      results.forEach((res, i) => {
        addLog(`Lead ${i + 1} Result: ${JSON.stringify(res)}`);
      });
    } catch (err) {
      addLog(`Error during concurrency test: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Testing Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleResetQuota}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg shadow transition-colors font-medium text-sm"
        >
          Reset Provider Quota via Webhook
        </button>
        
        <button
          onClick={handleTestIdempotency}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg shadow transition-colors font-medium text-sm"
        >
          Test Webhook Idempotency
        </button>
        
        <button
          onClick={handleSimulateConcurrency}
          className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg shadow transition-colors font-medium text-sm"
        >
          Simulate Concurrency (10 Instant Leads)
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden flex flex-col h-96">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <span className="text-gray-200 font-mono text-sm">Execution Logs</span>
          <button onClick={() => setLogs([])} className="text-gray-400 hover:text-white text-xs">Clear</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow font-mono text-sm text-green-400 space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">No logs yet. Run a test above.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="break-all">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
