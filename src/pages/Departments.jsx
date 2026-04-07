import React, { useState, useEffect } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  Alert02Icon,
  Building01Icon,
  Cancel01Icon,
  Delete01Icon,
  FileValidationIcon,
  FolderOpenIcon,
  Package01Icon,
  PencilEdit01Icon,
  SaveIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'

const Departments = () => {
  // Load departments from localStorage or use default
  const loadDepartments = () => {
    const saved = localStorage.getItem('departments')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error loading departments:', e)
      }
    }
    return [
      { id: 1, name: 'Beverages', description: 'Drinks and beverages', productCount: 0 },
      { id: 2, name: 'Bakery', description: 'Baked goods and pastries', productCount: 0 },
      { id: 3, name: 'Dairy', description: 'Dairy products', productCount: 0 },
      { id: 4, name: 'Grains', description: 'Rice, wheat, and grains', productCount: 0 },
      { id: 5, name: 'Cooking', description: 'Cooking ingredients', productCount: 0 },
      { id: 6, name: 'Baking', description: 'Baking supplies', productCount: 0 },
    ]
  }

  const [departments, setDepartments] = useState(loadDepartments)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' })
  const [searchTerm, setSearchTerm] = useState('')

  // Save departments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments))
  }, [departments])

  // Update product counts from products in localStorage
  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    setDepartments(prevDepartments => 
      prevDepartments.map(dept => ({
        ...dept,
        productCount: products.filter(p => p.category === dept.name).length
      }))
    )
  }, [])

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddDepartment = () => {
    if (!newDepartment.name.trim()) {
      alert('Department name is required')
      return
    }
    
    if (departments.some(d => d.name.toLowerCase() === newDepartment.name.toLowerCase())) {
      alert('A department with this name already exists')
      return
    }

    const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1
    const department = {
      id: newId,
      name: newDepartment.name.trim(),
      description: newDepartment.description.trim() || '',
      productCount: 0
    }
    
    setDepartments([...departments, department])
    setNewDepartment({ name: '', description: '' })
    setShowDepartmentModal(false)
    alert(`Department "${department.name}" added successfully!`)
  }

  const handleEditDepartment = (department) => {
    setEditingDepartment(department)
    setNewDepartment({ name: department.name, description: department.description || '' })
    setShowDepartmentModal(true)
  }

  const handleUpdateDepartment = () => {
    if (!newDepartment.name.trim()) {
      alert('Department name is required')
      return
    }

    const existingDept = departments.find(d => 
      d.id !== editingDepartment.id && 
      d.name.toLowerCase() === newDepartment.name.toLowerCase()
    )
    
    if (existingDept) {
      alert('A department with this name already exists')
      return
    }

    // Update department
    const updatedDepartments = departments.map(d =>
      d.id === editingDepartment.id
        ? { ...d, name: newDepartment.name.trim(), description: newDepartment.description.trim() || '' }
        : d
    )

    // Update products that use this department
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    const updatedProducts = products.map(p =>
      p.category === editingDepartment.name
        ? { ...p, category: newDepartment.name.trim() }
        : p
    )
    localStorage.setItem('products', JSON.stringify(updatedProducts))

    setDepartments(updatedDepartments)
    setEditingDepartment(null)
    setNewDepartment({ name: '', description: '' })
    setShowDepartmentModal(false)
    alert(`Department updated successfully!`)
  }

  const handleDeleteDepartment = (department) => {
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    const productCount = products.filter(p => p.category === department.name).length
    
    if (productCount > 0) {
      if (!window.confirm(
        `This department has ${productCount} product(s). Deleting it will remove the department from all products. Continue?`
      )) {
        return
      }
      
      // Remove category from products
      const updatedProducts = products.map(p =>
        p.category === department.name ? { ...p, category: 'Other' } : p
      )
      localStorage.setItem('products', JSON.stringify(updatedProducts))
    }

    setDepartments(departments.filter(d => d.id !== department.id))
    alert(`Department "${department.name}" deleted successfully!`)
  }

  const handleCloseDepartmentModal = () => {
    setShowDepartmentModal(false)
    setEditingDepartment(null)
    setNewDepartment({ name: '', description: '' })
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={Building01Icon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Department Management</h1>
                <p className="text-gray-500 text-xs">Organize your inventory by creating and managing departments</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingDepartment(null)
                setNewDepartment({ name: '', description: '' })
                setShowDepartmentModal(true)
              }}
              className="btn-primary flex items-center"
            >
              <HIcon icon={Add01Icon} size={18} className="mr-2"  />
              Add Department
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}  />
          <input
            type="text"
            placeholder="Search departments by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Department Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Product Count</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <HIcon icon={FolderOpenIcon} size={20} className="text-primary-600 mr-3"  />
                        <span className="font-semibold text-gray-900 text-lg">{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {dept.description || <span className="text-gray-500 italic">No description</span>}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <HIcon icon={Package01Icon} size={18} className="text-gray-400 mr-2"  />
                        <span className="font-semibold text-gray-900 text-lg">
                          {dept.productCount}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          product{dept.productCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                          title="Edit Department"
                        >
                          <HIcon icon={PencilEdit01Icon} size={18}  />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Department"
                        >
                          <HIcon icon={Delete01Icon} size={18}  />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <HIcon icon={Building01Icon} size={64} className="text-gray-300 mb-4"  />
                      <p className="text-lg font-medium text-gray-500">No departments found</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {searchTerm 
                          ? 'Try adjusting your search terms' 
                          : 'Click "Add Department" to create your first department'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Department Management Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gray-900 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary-500 p-2 rounded-lg mr-3">
                    <HIcon icon={Building01Icon} size={24} className="text-white"  />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingDepartment ? 'Edit Department' : 'Add New Department'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {editingDepartment ? 'Update department information' : 'Create a new product department'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDepartmentModal} 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <HIcon icon={Cancel01Icon} size={24}  />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Department Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Building01Icon} size={16} className="text-primary-600 mr-2"  />
                    Department Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Electronics, Clothing, Food & Beverages"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={FileValidationIcon} size={16} className="text-primary-600 mr-2"  />
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Brief description of this department..."
                  />
                </div>

                {/* Info Box */}
                {editingDepartment && (
                  <div className="p-4 bg-primary-50 border-l-4 border-primary-500 rounded-lg">
                    <div className="flex items-start">
                      <HIcon icon={Alert02Icon} size={20} className="text-primary-600 mr-3 mt-0.5"  />
                      <div>
                        <p className="text-sm font-medium text-primary-900">Update Notice</p>
                        <p className="text-xs text-primary-700 mt-1">
                          Changing the department name will update all products currently assigned to this department.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button 
                  onClick={handleCloseDepartmentModal} 
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <HIcon icon={Cancel01Icon} size={18} className="mr-2"  />
                  Cancel
                </button>
                <button 
                  onClick={editingDepartment ? handleUpdateDepartment : handleAddDepartment} 
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <HIcon icon={SaveIcon} size={18} className="mr-2"  />
                  {editingDepartment ? 'Update Department' : 'Add Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments

