import React, { useState, useEffect } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Activity01Icon,
  Add01Icon,
  AlertCircleIcon,
  ArrowMoveUpRightIcon,
  CallIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete01Icon,
  KeyIcon,
  LockIcon,
  Mail01Icon,
  PencilEdit01Icon,
  Search01Icon,
  Shield01Icon,
  UserCheck01Icon,
  UserGroupIcon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'

const Staff = () => {
  // Role permissions matrix
  const ROLE_PERMISSIONS = {
    Admin: {
      dashboard: true,
      pos: true,
      inventory: { view: true, add: true, edit: true, delete: true, import: true, export: true },
      reports: { view: true, export: true },
      customers: { view: true, add: true, edit: true, delete: true },
      accounting: { view: true, edit: true, export: true },
      staff: { view: true, add: true, edit: true, delete: true },
      settings: true
    },
    Manager: {
      dashboard: true,
      pos: true,
      inventory: { view: true, add: true, edit: true, delete: false, import: true, export: true },
      reports: { view: true, export: true },
      customers: { view: true, add: true, edit: true, delete: false },
      accounting: { view: true, edit: false, export: true },
      staff: { view: true, add: false, edit: false, delete: false },
      settings: false
    },
    Accountant: {
      dashboard: true,
      pos: false,
      inventory: { view: true, add: false, edit: false, delete: false, import: false, export: true },
      reports: { view: true, export: true },
      customers: { view: true, add: false, edit: false, delete: false },
      accounting: { view: true, edit: true, export: true },
      staff: { view: true, add: false, edit: false, delete: false },
      settings: false
    },
    Cashier: {
      dashboard: true,
      pos: true,
      inventory: { view: true, add: false, edit: false, delete: false, import: false, export: false },
      reports: { view: false, export: false },
      customers: { view: true, add: true, edit: false, delete: false },
      accounting: { view: false, edit: false, export: false },
      staff: { view: false, add: false, edit: false, delete: false },
      settings: false
    }
  }

  const [staff, setStaff] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@awosel.com', 
      username: 'johndoe',
      phone: '+233 24 123 4567', 
      role: 'Admin', 
      status: 'active', 
      lastLogin: '2024-01-15 10:30', 
      salesToday: 0,
      dateJoined: '2023-01-15',
      password: 'hashed_password_here' // In real app, this would be hashed
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@awosel.com',
      username: 'janesmith',
      phone: '+233 24 234 5678', 
      role: 'Manager', 
      status: 'active', 
      lastLogin: '2024-01-15 09:15', 
      salesToday: 1250,
      dateJoined: '2023-03-20',
      password: 'hashed_password_here'
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      email: 'michael@awosel.com',
      username: 'michaelbrown',
      phone: '+233 24 345 6789', 
      role: 'Cashier', 
      status: 'active', 
      lastLogin: '2024-01-15 08:00', 
      salesToday: 890,
      dateJoined: '2023-05-10',
      password: 'hashed_password_here'
    },
    { 
      id: 4, 
      name: 'Sarah Johnson', 
      email: 'sarah@awosel.com',
      username: 'sarahjohnson',
      phone: '+233 24 456 7890', 
      role: 'Cashier', 
      status: 'active', 
      lastLogin: '2024-01-14 17:30', 
      salesToday: 0,
      dateJoined: '2023-07-25',
      password: 'hashed_password_here'
    },
    { 
      id: 5, 
      name: 'David Wilson', 
      email: 'david@awosel.com',
      username: 'davidwilson',
      phone: '+233 24 567 8901', 
      role: 'Accountant', 
      status: 'active', 
      lastLogin: '2024-01-15 11:00', 
      salesToday: 0,
      dateJoined: '2023-09-12',
      password: 'hashed_password_here'
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [selectedRole, setSelectedRole] = useState('Cashier')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || s.role === filterRole
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <HIcon icon={Shield01Icon} size={16} className="text-red-600"  />
      case 'Manager':
        return <HIcon icon={UserCheck01Icon} size={16} className="text-primary-600"  />
      case 'Accountant':
        return <HIcon icon={KeyIcon} size={16} className="text-amber-600"  />
      default:
        return <HIcon icon={UserIcon} size={16} className="text-gray-600"  />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700'
      case 'Manager':
        return 'bg-primary-100 text-primary-700'
      case 'Accountant':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const deleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== id))
    }
  }

  const handleSaveStaff = (staffData) => {
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id ? { ...staffData, id: editingStaff.id } : s
      ))
      setEditingStaff(null)
    } else {
      const newId = staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1
      const newStaff = {
        ...staffData,
        id: newId,
        status: 'active',
        salesToday: 0,
        lastLogin: 'Never',
        dateJoined: new Date().toISOString().split('T')[0],
        password: 'hashed_password_here' // In real app, hash the password
      }
      setStaff([...staff, newStaff])
    }
    setShowAddModal(false)
  }

  const handleEditClick = (member) => {
    setEditingStaff(member)
    setShowAddModal(true)
  }

  const handleResetPassword = (staffId, newPassword) => {
    setStaff(staff.map(s => 
      s.id === staffId ? { ...s, password: `hashed_${newPassword}` } : s
    ))
    setShowPasswordModal(false)
    alert('Password reset successfully!')
  }

  const roleStats = {
    Admin: staff.filter(s => s.role === 'Admin').length,
    Manager: staff.filter(s => s.role === 'Manager').length,
    Accountant: staff.filter(s => s.role === 'Accountant').length,
    Cashier: staff.filter(s => s.role === 'Cashier').length,
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={UserCheck01Icon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Staff Management</h1>
                <p className="text-gray-500 text-xs">Manage staff members, roles, and credentials</p>
              </div>
            </div>
            <button 
              className="btn-primary flex items-center" 
              onClick={() => {
                setEditingStaff(null)
                setShowAddModal(true)
              }}
            >
              <HIcon icon={Add01Icon} size={18} className="mr-2"  />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              <div className="flex items-center mt-2">
                <HIcon icon={UserGroupIcon} size={14} className="text-primary-600 mr-1"  />
                <span className="text-xs text-gray-600">All members</span>
              </div>
            </div>
            <div className="bg-primary-600 p-3 rounded-lg">
              <HIcon icon={UserGroupIcon} size={24} className="text-white"  />
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Staff</p>
              <p className="text-2xl font-bold text-green-700">
                {staff.filter(s => s.status === 'active').length}
              </p>
              <div className="flex items-center mt-2">
                <HIcon icon={CheckmarkCircle02Icon} size={14} className="text-green-600 mr-1"  />
                <span className="text-xs text-gray-600">Currently active</span>
              </div>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <HIcon icon={Activity01Icon} size={24} className="text-white"  />
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Admins</p>
              <p className="text-2xl font-bold text-red-700">{roleStats.Admin}</p>
              <div className="flex items-center mt-2">
                <HIcon icon={Shield01Icon} size={14} className="text-red-600 mr-1"  />
                <span className="text-xs text-gray-600">Full access</span>
              </div>
            </div>
            <div className="bg-red-600 p-3 rounded-lg">
              <HIcon icon={Shield01Icon} size={24} className="text-white"  />
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Managers</p>
              <p className="text-2xl font-bold text-primary-700">{roleStats.Manager}</p>
              <div className="flex items-center mt-2">
                <HIcon icon={UserCheck01Icon} size={14} className="text-primary-600 mr-1"  />
                <span className="text-xs text-gray-600">Management</span>
              </div>
            </div>
            <div className="bg-primary-600 p-3 rounded-lg">
              <HIcon icon={UserCheck01Icon} size={24} className="text-white"  />
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cashiers</p>
              <p className="text-2xl font-bold text-amber-700">{roleStats.Cashier}</p>
              <div className="flex items-center mt-2">
                <HIcon icon={UserIcon} size={14} className="text-amber-600 mr-1"  />
                <span className="text-xs text-gray-600">Point of sale</span>
              </div>
            </div>
            <div className="bg-amber-600 p-3 rounded-lg">
              <HIcon icon={UserIcon} size={24} className="text-white"  />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div className="relative">
            <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}  />
            <input
              type="text"
              placeholder="Search staff by name, email, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowPermissionsModal(true)}
                className="btn-secondary flex items-center"
              >
                <HIcon icon={Shield01Icon} size={18} className="mr-2"  />
                View Permissions Matrix
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <HIcon icon={UserGroupIcon} size={24} className="mr-3 text-primary-600"  />
              Staff Members
            </h2>
            <p className="text-sm text-gray-600 mt-2">Showing {filteredStaff.length} of {staff.length} staff members</p>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Staff Member</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Username</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Role</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Last Login</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Sales Today</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                        member.role === 'Admin' ? 'bg-red-100' :
                        member.role === 'Manager' ? 'bg-primary-100' :
                        member.role === 'Accountant' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}>
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <div className="flex items-center mt-1">
                          <HIcon icon={Mail01Icon} size={12} className="text-gray-400 mr-1"  />
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">{member.username}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-700">
                      <HIcon icon={CallIcon} size={14} className="text-gray-400 mr-2"  />
                      {member.phone}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getRoleColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1.5">{member.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center w-fit ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.status === 'active' && <HIcon icon={CheckmarkCircle02Icon} size={12} className="mr-1"  />}
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700 text-sm">
                    <div className="flex items-center">
                      <HIcon icon={Clock01Icon} size={14} className="text-gray-400 mr-2"  />
                      {member.lastLogin === 'Never' ? (
                        <span className="text-gray-500 italic">Never</span>
                      ) : (
                        <span>{new Date(member.lastLogin).toLocaleString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-primary-600">
                      ₵{member.salesToday.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(member)}
                        className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                        title="Edit Staff"
                      >
                        <HIcon icon={PencilEdit01Icon} size={18}  />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStaff(member)
                          setShowPasswordModal(true)
                        }}
                        className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                        title="Reset Password"
                      >
                        <HIcon icon={LockIcon} size={18}  />
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Staff"
                      >
                        <HIcon icon={Delete01Icon} size={18}  />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-12 text-center">
                  <div className="flex flex-col items-center">
                    <HIcon icon={UserGroupIcon} size={48} className="text-gray-300 mb-3"  />
                    <p className="text-gray-500 font-medium">No staff members found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddModal && (
        <StaffModal
          staff={editingStaff}
          onSave={handleSaveStaff}
          onClose={() => {
            setShowAddModal(false)
            setEditingStaff(null)
          }}
        />
      )}

      {/* Permissions Matrix Modal */}
      {showPermissionsModal && (
        <PermissionsModal
          permissions={ROLE_PERMISSIONS}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && editingStaff && (
        <PasswordModal
          staff={editingStaff}
          onReset={handleResetPassword}
          onClose={() => {
            setShowPasswordModal(false)
            setEditingStaff(null)
          }}
        />
      )}
    </div>
  )
}

// Staff Add/Edit Modal
const StaffModal = ({ staff, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    username: staff?.username || '',
    phone: staff?.phone || '',
    role: staff?.role || 'Cashier',
    status: staff?.status || 'active',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const roles = ['Admin', 'Manager', 'Accountant', 'Cashier']

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!staff && !formData.password) {
      newErrors.password = 'Password is required for new staff'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-primary-50 to-transparent flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg mr-3">
              {staff ? <HIcon icon={PencilEdit01Icon} size={24} className="text-white"  /> : <HIcon icon={Add01Icon} size={24} className="text-white"  />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {staff ? 'Update staff information and credentials' : 'Fill in the details to add a new staff member'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HIcon icon={Cancel01Icon} size={24}  />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="johndoe"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+233 24 123 4567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the staff member's role</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {staff ? 'New Password (leave blank to keep current)' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={staff ? 'Enter new password or leave blank' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <HIcon icon={ViewOffIcon} size={18}  /> : <HIcon icon={ViewIcon} size={18}  />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            {staff ? 'Update Staff' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Permissions Matrix Modal
const PermissionsModal = ({ permissions, onClose }) => {
  const roles = Object.keys(permissions)
  const permissionCategories = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'pos', label: 'POS / Checkout' },
    { key: 'inventory', label: 'Inventory', subPermissions: ['view', 'add', 'edit', 'delete', 'import', 'export'] },
    { key: 'reports', label: 'Reports', subPermissions: ['view', 'export'] },
    { key: 'customers', label: 'Customers', subPermissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'accounting', label: 'Accounting', subPermissions: ['view', 'edit', 'export'] },
    { key: 'staff', label: 'Staff Management', subPermissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'settings', label: 'Settings' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-primary-50 to-transparent flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-500 p-2 rounded-lg mr-3">
              <HIcon icon={Shield01Icon} size={24} className="text-white"  />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Role Permissions Matrix</h2>
              <p className="text-sm text-gray-600 mt-1">View and understand permissions for each role in the system</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HIcon icon={Cancel01Icon} size={24}  />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Permission</th>
                  {roles.map(role => (
                    <th key={role} className="text-center py-4 px-4 font-bold text-gray-900">
                      <div className="flex items-center justify-center">
                        {role === 'Admin' && <HIcon icon={Shield01Icon} size={16} className="text-red-600 mr-2"  />}
                        {role === 'Manager' && <HIcon icon={UserCheck01Icon} size={16} className="text-primary-600 mr-2"  />}
                        {role === 'Accountant' && <HIcon icon={KeyIcon} size={16} className="text-amber-600 mr-2"  />}
                        {role === 'Cashier' && <HIcon icon={UserIcon} size={16} className="text-gray-600 mr-2"  />}
                        {role}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionCategories.map((category) => {
                  if (category.subPermissions) {
                    return (
                      <React.Fragment key={category.key}>
                        <tr className="bg-gray-50">
                          <td colSpan={roles.length + 1} className="py-2 px-4 font-semibold text-gray-900">
                            {category.label}
                          </td>
                        </tr>
                        {category.subPermissions.map(subPerm => (
                          <tr key={`${category.key}-${subPerm}`} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 pl-8 text-gray-700 capitalize">
                              {subPerm.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            {roles.map(role => (
                              <td key={role} className="text-center py-2 px-4">
                                {permissions[role][category.key]?.[subPerm] ? (
                                  <HIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-600 mx-auto"  />
                                ) : (
                                  <HIcon icon={Cancel01Icon} size={20} className="text-red-600 mx-auto"  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  } else {
                    return (
                      <tr key={category.key} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-900">{category.label}</td>
                        {roles.map(role => (
                          <td key={role} className="text-center py-2 px-4">
                            {permissions[role][category.key] ? (
                              <HIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-600 mx-auto"  />
                            ) : (
                              <HIcon icon={Cancel01Icon} size={20} className="text-red-600 mx-auto"  />
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Password Reset Modal
const PasswordModal = ({ staff, onReset, onClose }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onReset(staff.id, password)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-primary-50 to-transparent flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-500 p-2 rounded-lg mr-3">
              <HIcon icon={LockIcon} size={24} className="text-white"  />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-600 mt-1">Reset password for <span className="font-semibold">{staff.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HIcon icon={Cancel01Icon} size={24}  />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <HIcon icon={ViewOffIcon} size={18}  /> : <HIcon icon={ViewIcon} size={18}  />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                }}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <HIcon icon={ViewOffIcon} size={18}  /> : <HIcon icon={ViewIcon} size={18}  />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </form>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  )
}

export default Staff
