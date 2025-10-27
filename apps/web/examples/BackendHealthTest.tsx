"use client";

import React, { useState, useEffect } from 'react';

const BackendHealthTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const checkHealth = async () => {
    setHealthStatus('checking');
    setError(null);
    
    try {
      // Test the health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthData(healthData);
        setHealthStatus('healthy');
      } else {
        setError(`Health endpoint returned ${healthResponse.status}: ${healthResponse.statusText}`);
        setHealthStatus('unhealthy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealthStatus('unhealthy');
    }
  };

  const checkRootEndpoint = async () => {
    setHealthStatus('checking');
    setError(null);
    
    try {
      // Test the root endpoint
      const rootResponse = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.text();
        setHealthData({ message: rootData, endpoint: 'root' });
        setHealthStatus('healthy');
      } else {
        setError(`Root endpoint returned ${rootResponse.status}: ${rootResponse.statusText}`);
        setHealthStatus('unhealthy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealthStatus('unhealthy');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Backend Health Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={checkHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Health Endpoint
          </button>
          <button
            onClick={checkRootEndpoint}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Root Endpoint
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Status:</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
              healthStatus === 'healthy' ? 'bg-green-400' :
              'bg-red-400'
            }`}></div>
            <span className={`font-medium ${
              healthStatus === 'checking' ? 'text-yellow-600' :
              healthStatus === 'healthy' ? 'text-green-600' :
              'text-red-600'
            }`}>
              {healthStatus === 'checking' ? 'Checking...' :
               healthStatus === 'healthy' ? 'Healthy' :
               'Unhealthy'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {healthData && (
          <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Response Data:</h3>
            <pre className="text-green-700 text-sm overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-semibold mb-2">API Base URL:</h3>
          <p className="text-sm font-mono">{API_BASE_URL}</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Make sure your backend server is running on port 8080</li>
            <li>Click "Test Health Endpoint" to test the new /api/health endpoint</li>
            <li>Click "Test Root Endpoint" to test the basic root endpoint</li>
            <li>If both fail, check that your backend server is running</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BackendHealthTest;
