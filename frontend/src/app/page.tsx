'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { setupDatabase } from '@/lib/setup';
import { User, CandidateSet, Node, HierarchyLevel } from '@/lib/types';
import { UserSelector } from '@/components/UserSelector';
import { FilterFunnel } from '@/components/FilterFunnel';
import { CandidateTable } from '@/components/CandidateTable';
import { DAGViewer } from '@/components/DAGViewer';
import { ComparisonView } from '@/components/ComparisonView';

export default function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [candidateSet, setCandidateSet] = useState<CandidateSet | null>(null);
    const [results, setResults] = useState<CandidateSet[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [hierarchy, setHierarchy] = useState<HierarchyLevel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Step 1: Setup database
            console.log('🔄 Initializing database...');
            const setupResult = await setupDatabase();

            if (!setupResult.success) {
                setError('Failed to setup database. Please check your connection and run the CREATE TABLE statements in Supabase SQL Editor.');
                setIsInitializing(false);
                return;
            }

            // Step 2: Load data
            await loadData();

        } catch (err) {
            console.error('Initialization error:', err);
            setError('Failed to initialize app. Please check your connection.');
        } finally {
            setIsInitializing(false);
        }
    };

        const loadData = async () => {
        try {
            console.log('📥 Loading data from Supabase...');

            // Load users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*');

            if (usersError) {
                console.error('Users query error:', usersError);
                setError(`Failed to load users: ${usersError.message}`);
                return;
            }

            // ✅ THIS PART IS CRITICAL:
            console.log('✅ Raw users from DB:', usersData);

            // YOU MUST ADD THIS LINE TO UPDATE THE STATE:
            setUsers(usersData || []); 

            // ... rest of your loadData code (loading edges, nodes, hierarchy, etc)
            
        } catch (err) {
            console.error('Error loading data:', err);
            setError(`Connection error: ${err.message}`);
        }
    };

    const runPipeline = async () => {
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/pipeline/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: selectedUserId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCandidateSet(data);
            setResults(prev => {
                const exists = prev.some(r => r.user_id === data.user_id);
                if (exists) {
                    return prev.map(r => r.user_id === data.user_id ? data : r);
                }
                return [...prev, data];
            });
        } catch (err) {
            console.error('Error running pipeline:', err);
            setError('Failed to run pipeline. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const getReachableNodes = () => {
        if (!candidateSet) return new Set<string>();
        return new Set(candidateSet.candidate_set.map(n => n.id));
    };

    const getZone2Nodes = () => {
        if (!candidateSet) return new Set<string>();
        return new Set(
            candidateSet.candidate_set
                .filter(n => n.zone === 2)
                .map(n => n.id)
        );
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Initializing database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        BRAHMO Rules Engine
                    </h1>
                    <p className="text-sm text-gray-500">
                        BFS Traversal + 5-Check Filter Pipeline — Zero LLM
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 whitespace-pre-wrap">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="flex flex-wrap items-end gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <UserSelector
                            users={users}
                            selectedUserId={selectedUserId}
                            onSelect={setSelectedUserId}
                        />
                    </div>
                    <button
                        onClick={runPipeline}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Running...' : 'Run Pipeline'}
                    </button>
                </div>

                {selectedUser && (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        <span className="font-medium">Current User:</span>{' '}
                        {selectedUser.name} — {selectedUser.role}, Level {selectedUser.ceiling_level}, {selectedUser.department}
                        {candidateSet && (
                            <span className="ml-4 text-blue-600">
                                → {candidateSet.funnel.after_check5} nodes in candidate set
                            </span>
                        )}
                    </div>
                )}

                {candidateSet && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FilterFunnel stats={candidateSet.funnel} />
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pipeline Timing</h3>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <span className="text-gray-500">Permission Compile:</span>
                                    <span className="font-mono">{candidateSet.pipeline_timing.permission_compile_ms.toFixed(1)}ms</span>
                                    <span className="text-gray-500">BFS Traversal:</span>
                                    <span className="font-mono">{candidateSet.pipeline_timing.bfs_ms.toFixed(1)}ms</span>
                                    <span className="text-gray-500">Zone 2 Injection:</span>
                                    <span className="font-mono">{candidateSet.pipeline_timing.zone2_inject_ms.toFixed(1)}ms</span>
                                    <span className="text-gray-500 font-semibold">Total:</span>
                                    <span className="font-mono font-bold text-blue-600">{candidateSet.pipeline_timing.total_ms.toFixed(1)}ms</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DAGViewer
                                hierarchy={hierarchy}
                                nodes={nodes}
                                reachableNodeIds={getReachableNodes()}
                                zone2NodeIds={getZone2Nodes()}
                                entryPoint={candidateSet.entry_point}
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Candidate Set</h3>
                                <CandidateTable nodes={candidateSet.candidate_set} />
                            </div>
                        </div>

                        <ComparisonView results={results} />
                    </div>
                )}

                {!candidateSet && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">Select a user and click "Run Pipeline"</p>
                        <p className="text-sm mt-2">The pipeline will traverse the DAG and apply 5 checks to produce a candidate set</p>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-2 text-gray-500">Running pipeline...</p>
                    </div>
                )}
            </main>
        </div>
    );
}