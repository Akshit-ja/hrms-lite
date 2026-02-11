import React, { useEffect, useState } from 'react';
import {
  getEmployees,
  getEmployeeAttendance,
  getEmployeeAttendanceSummary,
  markAttendance,
} from '../api/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import toast from 'react-hot-toast';
import { CalendarCheck, UserCheck, UserX, CheckCircle, XCircle, Filter } from 'lucide-react';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('Present');
  const [marking, setMarking] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (empId, filters = {}) => {
    if (!empId) return;
    setAttLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const [records, sum] = await Promise.all([
        getEmployeeAttendance(empId, params),
        getEmployeeAttendanceSummary(empId),
      ]);
      setAttendance(records);
      setSummary(sum);
    } catch (err) {
      toast.error('Failed to load attendance records');
    } finally {
      setAttLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee, { start_date: startDate, end_date: endDate });
    } else {
      setAttendance([]);
      setSummary(null);
    }
  }, [selectedEmployee]);

  const handleFilter = () => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee, { start_date: startDate, end_date: endDate });
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee, {});
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee first');
      return;
    }
    setMarking(true);
    try {
      await markAttendance({
        employee_id: selectedEmployee,
        date: markDate,
        status: markStatus,
      });
      toast.success(`Attendance marked as ${markStatus}`);
      fetchAttendance(selectedEmployee, { start_date: startDate, end_date: endDate });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <Loading message="Loading attendance page..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

  if (employees.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track daily employee attendance</p>
        </div>
        <EmptyState
          title="No employees found"
          message="Add employees first to start tracking attendance."
          icon={CalendarCheck}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">Track daily employee attendance</p>
      </div>

      {/* Employee Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">-- Choose an employee --</option>
          {employees.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.full_name} ({emp.employee_id})
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Present</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.total_present}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Absent</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.total_absent}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.total_records}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mark Attendance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Mark Attendance</h2>
            <form onSubmit={handleMarkAttendance} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkStatus('Present')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border ${
                      markStatus === 'Present'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkStatus('Absent')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border ${
                      markStatus === 'Absent'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Absent
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={marking}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {marking ? 'Marking...' : 'Mark Attendance'}
              </button>
            </form>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Date
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 transition-colors"
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilter}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Attendance Records</h2>
            </div>
            {attLoading ? (
              <Loading message="Loading records..." />
            ) : attendance.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{record.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                              record.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {record.status === 'Present' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {attendance.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-3 bg-slate-50">
                <p className="text-xs text-slate-500">
                  Showing {attendance.length} record{attendance.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
