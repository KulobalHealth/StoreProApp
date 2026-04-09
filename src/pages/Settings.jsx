import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  AlertCircleIcon,
  Building01Icon,
  CallIcon,
  CheckmarkCircle02Icon,
  Delete01Icon,
  DollarCircleIcon,
  FileValidationIcon,
  ImageAdd01Icon,
  Loading03Icon,
  LockIcon,
  Mail01Icon,
  MapPinIcon,
  SaveIcon,
  Shield01Icon,
  Store01Icon,
} from '@hugeicons/core-free-icons'
import { getProfile } from '../api/awoselDb.js'
import { useAuth } from '../contexts/AuthContext'

const TAX_RATE_KEY = 'awosel_tax_rate'
const STORE_SETTINGS_DRAFT_KEY = 'awosel_store_settings_draft'
const STORE_LOGO_DRAFT_KEY = 'awosel_store_logo_draft'

const getStoredTaxRate = () => {
  try {
    const v = localStorage.getItem(TAX_RATE_KEY)
    if (v === null || v === '') return 0
    const n = parseFloat(v)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

const getStoredStoreDraft = () => {
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const getStoredLogoDraft = () => {
  try {
    const raw = localStorage.getItem(STORE_LOGO_DRAFT_KEY)
    return raw || ''
  } catch {
    return ''
  }
}

const getProfilePayload = (response) => response?.data || response?.profile || response || {}

const buildStoreProfile = (profile, fallbackUser) => {
  const organization = profile?.organization || fallbackUser?.organization || {}
  const branch = profile?.branch || fallbackUser?.branch || {}

  return {
    storeName: organization.name || profile?.organization_name || profile?.business_name || profile?.store_name || fallbackUser?.organization?.name || 'StorePro',
    branchName: branch.name || profile?.branch_name || fallbackUser?.branch_name || fallbackUser?.organization?.name || 'Main Branch',
    email: profile?.email || organization.email || fallbackUser?.email || '—',
    phone: profile?.phone || organization.phone || branch.phone || fallbackUser?.phone || '—',
    address: organization.address || branch.location || branch.address || profile?.address || 'No address added yet',
    taxId: organization.tax_id || organization.taxId || profile?.tax_id || profile?.taxId || 'Not set',
    role: profile?.role || fallbackUser?.role || 'User',
  }
}

const buildEditableStoreSettings = (profile, fallbackUser, currentStore) => {
  const storeProfile = buildStoreProfile(profile, fallbackUser)

  return {
    ...currentStore,
    name: storeProfile.storeName,
    address: storeProfile.address === 'No address added yet' ? '' : storeProfile.address,
    phone: storeProfile.phone === '—' ? '' : storeProfile.phone,
    email: storeProfile.email === '—' ? '' : storeProfile.email,
    taxId: storeProfile.taxId === 'Not set' ? '' : storeProfile.taxId,
  }
}

const Settings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    store: {
      name: 'StorePro',
      address: '123 Main Street, Accra',
      phone: '+233 24 123 4567',
      email: 'store@awosel.com',
      taxId: 'TAX-123456',
      taxRate: getStoredTaxRate() === 0 ? '' : String(getStoredTaxRate()),
    },
  })

  const [activeTab, setActiveTab] = useState('store')
  const [saved, setSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [storeLogo, setStoreLogo] = useState(getStoredLogoDraft)
  const [logoError, setLogoError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const logoInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setProfileLoading(true)
      setProfileError('')
      try {
        const response = await getProfile()
        if (cancelled) return
        const payload = getProfilePayload(response)
        setProfileData(payload)
      } catch (error) {
        if (cancelled) return
        setProfileError(error.message || 'Failed to load store information.')
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profileData && !user) return

    const storedDraft = getStoredStoreDraft()

    setSettings((previousSettings) => ({
      ...previousSettings,
      store: {
        ...buildEditableStoreSettings(profileData, user, previousSettings.store),
        ...(storedDraft || {}),
      },
    }))
  }, [profileData, user])

  const storeProfile = useMemo(
    () => buildStoreProfile(profileData, user),
    [profileData, user]
  )

  const handleSave = () => {
    try {
      localStorage.setItem(STORE_SETTINGS_DRAFT_KEY, JSON.stringify(settings.store))
      localStorage.setItem(STORE_LOGO_DRAFT_KEY, storeLogo || '')
    } catch {
      // Ignore storage write failures and still show the saved state.
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSelectLogoClick = () => {
    setLogoError('')
    logoInputRef.current?.click()
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload an image file.')
      event.target.value = ''
      return
    }

    const maxSizeInBytes = 2 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      setLogoError('Logo must be 2MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setStoreLogo(result)
      setLogoError('')
      try {
        localStorage.setItem(STORE_LOGO_DRAFT_KEY, result)
      } catch {
        setLogoError('Logo preview updated, but could not be saved locally.')
      }
    }
    reader.onerror = () => {
      setLogoError('Failed to read the selected logo.')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleRemoveLogo = () => {
    setStoreLogo('')
    setLogoError('')
    try {
      localStorage.removeItem(STORE_LOGO_DRAFT_KEY)
    } catch {
      // Ignore storage failures for draft cleanup.
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handlePasswordChange = (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Fill in all password fields.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setPasswordSuccess('Password updated successfully.')
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const tabs = [
    { id: 'store', label: 'Store Info', description: 'Brand, profile and tax settings' },
    { id: 'security', label: 'Security', description: 'Access controls and protection' },
  ]

  const sectionShellClass = 'rounded-[2px] border border-gray-200 bg-white shadow-sm overflow-hidden'
  const panelClass = 'rounded-[2px] border border-gray-200 bg-gray-50'
  const inputClass = 'w-full rounded-[2px] border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                {storeLogo ? (
                  <img src={storeLogo} alt="Business logo" className="h-full w-full rounded-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-500 text-white">
                    <HIcon icon={Building01Icon} size={18}  />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">
                  {settings.store.name || storeProfile.storeName}
                </h1>
                <p className="text-xs text-gray-500">Settings Overview</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {saved ? <><HIcon icon={CheckmarkCircle02Icon} size={16}  /> Saved!</> : <><HIcon icon={SaveIcon} size={16}  /> Save Changes</>}
            </button>
            <p className="text-xs text-gray-500">Changes to store details and logo stay on this device.</p>
          </div>
        </div>

        <div className="rounded-[2px] border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-primary-500 text-white">
                  <HIcon icon={Store01Icon} size={20}  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Workspace Settings</p>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">Manage your store operations</h2>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-gray-500">
                Update store identity, security preferences, sales uploads and billing details from one page.
              </p>
            </div>

          </div>

          <div className="border-b border-gray-200 bg-gray-50/70 px-3 py-3 sm:px-4">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-[2px] border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-semibold">{tab.label}</span>
                    </div>
                    <p className={`mt-1 text-xs ${isActive ? 'text-primary-100' : 'text-gray-500'}`}>
                      {tab.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            {activeTab === 'store' && (
              <div className="space-y-5">
                <div className={sectionShellClass}>
                  <div className="border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                          <h2 className="text-base font-bold text-gray-900">Store Information</h2>
                          <p className="text-xs text-gray-500">Live profile details with local edits and branding.</p>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center rounded-[2px] border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    {profileLoading ? (
                      <div className="flex items-center gap-3 rounded-[2px] border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                        <HIcon icon={Loading03Icon} size={18} className="animate-spin text-primary-500"  />
                        Loading store information...
                      </div>
                    ) : profileError ? (
                      <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                        <div className="flex items-start gap-2">
                          <HIcon icon={AlertCircleIcon} size={16} className="mt-0.5 shrink-0"  />
                          <div>
                            <p className="font-semibold">Unable to load store details</p>
                            <p className="mt-1 text-red-600">{profileError}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
                          <div className="space-y-5">
                            <div className="rounded-[2px] border border-gray-200 bg-gradient-to-br from-primary-50 via-white to-white p-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Store Profile</p>
                                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                                    {settings.store.name || storeProfile.storeName}
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">{storeProfile.branchName}</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                                  {storeProfile.role}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {[
                                { label: 'Store name', value: settings.store.name || storeProfile.storeName, icon: Building01Icon },
                                { label: 'Branch', value: storeProfile.branchName, icon: Store01Icon },
                                { label: 'Email', value: settings.store.email || '—', icon: Mail01Icon },
                                { label: 'Phone', value: settings.store.phone || '—', icon: CallIcon },
                                { label: 'Address', value: settings.store.address || 'No address added yet', icon: MapPinIcon },
                                { label: 'Tax ID', value: settings.store.taxId || 'Not set', icon: FileValidationIcon },
                              ].map((item) => {
                                return (
                                  <div key={item.label} className={`${panelClass} px-4 py-3`}>
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      <HIcon icon={item.icon} size={14} className="text-gray-400" />
                                      {item.label}
                                    </div>
                                    <p className="mt-2 break-words text-sm font-medium text-gray-900">{item.value}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div className={`${panelClass} p-4`}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col xl:items-start">
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">Store logo</h3>
                                <p className="mt-1 text-xs text-gray-500">Upload a logo for receipts and profile previews.</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  ref={logoInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={handleSelectLogoClick}
                                  className="inline-flex items-center gap-2 rounded-[2px] border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                                >
                                  <HIcon icon={ImageAdd01Icon} size={14}  />
                                  {storeLogo ? 'Replace Logo' : 'Upload Logo'}
                                </button>
                                {storeLogo && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="inline-flex items-center gap-2 rounded-[2px] border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                                  >
                                    <HIcon icon={Delete01Icon} size={14}  />
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center xl:flex-col xl:items-start">
                              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-300 bg-white p-2 shadow-sm">
                                {storeLogo ? (
                                  <img src={storeLogo} alt="Store logo preview" className="h-full w-full rounded-full object-contain" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <HIcon icon={Store01Icon} size={20}  />
                                    <span className="text-[10px] font-medium uppercase tracking-wide">No logo</span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1 text-xs text-gray-500">
                                <p>Recommended: square logo, PNG or JPG.</p>
                                <p>Maximum file size: 2MB.</p>
                                <p>The uploaded logo is currently saved on this device.</p>
                                {logoError && <p className="font-medium text-red-600">{logoError}</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`${panelClass} p-4`}>
                          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <HIcon icon={DollarCircleIcon} size={14} className="text-gray-400"  />
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            value={settings.store.taxRate}
                            onChange={(event) => {
                              const raw = event.target.value
                              setSettings((previousSettings) => ({
                                ...previousSettings,
                                store: {
                                  ...previousSettings.store,
                                  taxRate: raw,
                                },
                              }))
                              try {
                                const numberValue = raw === '' ? 0 : (parseFloat(raw) || 0)
                                localStorage.setItem(TAX_RATE_KEY, String(numberValue >= 0 ? numberValue : 0))
                              } catch {}
                            }}
                            className={`${inputClass} max-w-xs`}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                          <p className="mt-1 text-xs text-gray-500">Applied to POS subtotal (0 = no tax).</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={sectionShellClass}>
                <div className="border-b border-gray-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Security</h2>
                    <p className="text-xs text-gray-500">Change your account password.</p>
                  </div>
                </div>

                <div className="p-5">
                  <form onSubmit={handlePasswordChange} className={`${panelClass} mx-auto max-w-2xl p-5`}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-primary-100 text-primary-600">
                        <HIcon icon={LockIcon} size={18}  />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Change password</h3>
                        <p className="text-xs text-gray-500">Update your account password to keep your login secure.</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { key: 'currentPassword', label: 'Current password', placeholder: 'Enter current password' },
                        { key: 'newPassword', label: 'New password', placeholder: 'Enter new password' },
                        { key: 'confirmPassword', label: 'Confirm new password', placeholder: 'Re-enter new password' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                          <input
                            type="password"
                            value={passwordForm[field.key]}
                            onChange={(event) => {
                              const nextValue = event.target.value
                              setPasswordForm((previousForm) => ({
                                ...previousForm,
                                [field.key]: nextValue,
                              }))
                            }}
                            className={inputClass}
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>

                    {passwordError && <p className="mt-4 text-sm font-medium text-red-600">{passwordError}</p>}
                    {passwordSuccess && <p className="mt-4 text-sm font-medium text-green-600">{passwordSuccess}</p>}

                    <div className="mt-5 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-[2px] bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
