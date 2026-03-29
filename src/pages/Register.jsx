import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../MainLogo.jpeg'
import { Mail, Phone, User, Store, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { register as apiRegister } from '../api/awoselDb.js'
import { sanitizeInput, validateEmail, validatePhoneNumber } from '../utils/validation.js'

const Register = () => {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setIsLoading(true)
      setSuccess('')
      const trimmedEmail = sanitizeInput(email)
      const trimmedPhone = sanitizeInput(phone)
      const trimmedFirstName = sanitizeInput(firstName, 100)
      const trimmedLastName = sanitizeInput(lastName, 100)
      const trimmedStoreName = sanitizeInput(storeName, 200)

      if (!trimmedEmail || !password) {
        setError('Please enter email and password')
        setIsLoading(false)
        return
      }
      if (!validateEmail(trimmedEmail)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }
      if (trimmedPhone && !validatePhoneNumber(trimmedPhone)) {
        setError('Please enter a valid phone number (10-15 digits)')
        setIsLoading(false)
        return
      }
      if (!trimmedFirstName) {
        setError('First name is required')
        setIsLoading(false)
        return
      }
      if (!trimmedLastName) {
        setError('Last name is required')
        setIsLoading(false)
        return
      }
      if (!trimmedStoreName) {
        setError('Store name is required')
        setIsLoading(false)
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setIsLoading(false)
        return
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter')
        setIsLoading(false)
        return
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number')
        setIsLoading(false)
        return
      }

      await apiRegister({
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        storeName: trimmedStoreName,
        password: password,
      })

      setSuccess('Account created successfully! Redirecting to login…')
      setIsLoading(false)
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      console.error('Register error:', err)
      setError(err?.message || 'Could not reach server. Is the backend running?')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="StorePro" className="h-12 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Get started with StorePro in minutes</p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-green-50 border border-green-100 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-green-700 leading-snug">{success}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="+233241164088"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* First & Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Benjamin"
                    autoComplete="given-name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Andoh"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            {/* Store name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Ben Store"
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 mt-1 ${
                isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 StorePro. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Register
