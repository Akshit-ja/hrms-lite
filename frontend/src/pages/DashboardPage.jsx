import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../api/api';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { Users, UserCheck, UserX, Building2, Clock } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSummary} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your HR system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Employees"
          value={summary.total_employees}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={summary.total_present_today}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Absent Today"
          value={summary.total_absent_today}
          icon={UserX}
          color="red"
        />
        <StatCard
          title="Departments"
          value={summary.department_count}
          icon={Building2}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Breakdown</h2>
          {summary.department_stats.length === 0 ? (
            <p className="text-slate-400 text-sm">No departments yet</p>
          ) : (
            <div className="space-y-3">
              {summary.department_stats.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">{dept.department}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Attendance</h2>
          {summary.recent_attendance.length === 0 ? (
            <p className="text-slate-400 text-sm">No attendance records yet</p>
          ) : (
            <div className="space-y-3">
              {summary.recent_attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{record.employee_name}</p>
                    <p className="text-xs text-slate-400">{record.date}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      record.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
