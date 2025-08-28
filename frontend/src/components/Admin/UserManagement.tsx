import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { userAPI } from '../../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
  training_count: number;
  avg_score: number;
  last_training: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy as keyof User];
    const bValue = b[sortBy as keyof User];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === sortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map(user => user.id));
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Username,Email,Role,Registration Date,Training Count,Average Score\n"
      + sortedUsers.map(user => 
          `${user.username},${user.email},${user.role === 'admin' ? 'Administrator' : 'Student'},${new Date(user.created_at).toLocaleDateString()},${user.training_count || 0},${Math.round(user.avg_score || 0)}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all user accounts in the system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportUsers}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Registration Date</option>
              <option value="username">Username</option>
              <option value="training_count">Training Count</option>
              <option value="avg_score">Average Score</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadUsers}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            {selectedUsers.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedUsers.length} users selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training Statistics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Student'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>Training Count: {user.training_count || 0}</div>
                      <div className="text-gray-500">Average Score: {Math.round(user.avg_score || 0)}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('en-US')}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing all {sortedUsers.length} users
          </div>
          <div className="flex items-center space-x-2">
            {/* Pagination buttons can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;