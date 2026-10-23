import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { validateAadhaar, formatAadhaar } from '../utils/verhoeff'

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    otp: '',
    password: '',
  })

  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  if (user) {
    return <Navigate to="/" />
  }

  const cleanAadhaar = form.aadhaar.replace(/\s+/g, '')
  const isAadhaarLengthValid = cleanAadhaar.length === 12
  const isAadhaarChecksumValid = isAadhaarLengthValid && validateAadhaar(cleanAadhaar)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleAadhaarChange(e) {
    const formatted = formatAadhaar(e.target.value)
    setForm({ ...form, aadhaar: formatted })
    setError('')
    setSuccessMsg('')
  }

  async function handleSendOtp() {
    setError('')
    setSuccessMsg('')

    if (!isAadhaarChecksumValid) {
      setError('Please enter a valid 12-digit Aadhaar number.')
      return
    }

    setOtpLoading(true)
    try {
      const res = await api.post('/auth/aadhaar/send-otp', {
        aadhaar: cleanAadhaar,
        email: form.email,
      })

      setOtpSent(true)
      setCountdown(60) // 60s cooldown for resending
      setSuccessMsg(res.data.message || 'OTP sent successfully to your Aadhaar-linked mobile number.')
      // Clear OTP field so user enters it manually
      setForm((prev) => ({ ...prev, otp: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your Aadhaar number.')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!otpSent || !form.otp.trim()) {
      setError('Please request and enter the 6-digit OTP sent to your Aadhaar-linked mobile.')
      return
    }

    if (form.otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        aadhaar_number: cleanAadhaar,
        otp: form.otp.trim(),
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-green-100">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">🚜</span>
          <h2 className="text-2xl font-bold text-green-900">Create Account</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          One verified account lets you list equipment, rent machines, and securely trade with farmers.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Patel"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="farmer@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Aadhaar Verification Card */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1">
            Aadhaar Card Number
          </label>

          <div className="flex gap-2">
            <input
              name="aadhaar"
              value={form.aadhaar}
              onChange={handleAadhaarChange}
              maxLength={14}
              placeholder="1234 5678 9012"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <button
              type="button"
              disabled={!isAadhaarChecksumValid || otpLoading || countdown > 0}
              onClick={handleSendOtp}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white font-medium px-3 py-2 rounded-lg text-xs transition whitespace-nowrap"
            >
              {otpLoading ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : otpSent ? 'Resend OTP' : 'Get OTP'}
            </button>
          </div>

          <div className="mt-1.5 text-xs">
            {cleanAadhaar.length === 0 ? (
              <span className="text-gray-400">Enter your 12-digit Aadhaar number</span>
            ) : isAadhaarChecksumValid ? (
              <span className="text-emerald-700 font-medium">✓ Valid Aadhaar number</span>
            ) : cleanAadhaar.length === 12 ? (
              <span className="text-rose-600 font-medium">✗ Invalid Aadhaar checksum</span>
            ) : (
              <span className="text-gray-500">{12 - cleanAadhaar.length} more digits needed</span>
            )}
          </div>
        </div>

        {/* OTP Input - Manual Entry */}
        {otpSent && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Enter 6-Digit OTP
              </label>
              <span className="text-[11px] text-gray-500">Sent to linked mobile</span>
            </div>
            <input
              name="otp"
              maxLength={6}
              value={form.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              className="w-full border-2 border-green-600 rounded-lg px-3 py-2 font-mono text-center tracking-widest text-lg font-bold bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        )}

        {/* Password */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Set Password</label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !otpSent}
          className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition shadow-sm text-sm"
        >
          {loading ? 'Verifying...' : otpSent ? 'Verify OTP & Register' : 'Request OTP to Continue'}
        </button>

        <p className="text-xs text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register
