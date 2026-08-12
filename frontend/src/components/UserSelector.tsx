// src/components/UserSelector.tsx
import React from 'react';
import { User } from '@/lib/types';

interface UserSelectorProps {
    users: User[];
    selectedUserId: string;
    onSelect: (userId: string) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ 
    users, 
    selectedUserId, 
    onSelect 
}) => {
    return (
        <div className="w-full">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select User
            </label>
            <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
                <option value="">Select a user...</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name} — {user.role}, Level {user.ceiling_level}
                    </option>
                ))}
            </select>
        </div>
    );
};