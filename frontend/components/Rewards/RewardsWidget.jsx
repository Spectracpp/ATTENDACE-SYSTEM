'use client';
import { useState } from 'react';
import Link from 'next/link';

const RewardsWidget = ({ userStats }) => {
  // Mock data - Replace with actual data from your backend
  const mockUserStats = {
    tokens: 150,
    currentStreak: 5,
    longestStreak: 15,
    weeklyAttendance: 4,
    monthlyAttendance: 18,
    level: 3,
    availableRewards: 2,
  };

  const stats = userStats || mockUserStats;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
      {/* Current Balance & Level */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rewards Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.tokens} 🪙</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Level</span>
          <p className="text-2xl font-bold text-gray-900">{stats.level}</p>
        </div>
      </div>

      {/* Streak Information */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Streak</span>
          <div className="flex items-center">
            <span className="text-orange-500 font-semibold">
              {stats.currentStreak} days 🔥
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Longest Streak</span>
          <span className="text-gray-900 font-semibold">{stats.longestStreak} days</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Weekly Progress</span>
            <span className="text-gray-900 font-medium">{stats.weeklyAttendance}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2"
              style={{ width: `${(stats.weeklyAttendance / 5) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Monthly Goal</span>
            <span className="text-gray-900 font-medium">{stats.monthlyAttendance}/22</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 rounded-full h-2"
              style={{ width: `${(stats.monthlyAttendance / 22) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/rewards/store"
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Redeem Rewards ({stats.availableRewards})
        </Link>
        <Link
          href="/rewards/history"
          className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
        >
          View History
        </Link>
      </div>
    </div>
  );
};

export default RewardsWidget;
