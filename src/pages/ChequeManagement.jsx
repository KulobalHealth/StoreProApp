import React, { useMemo, useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Alert02Icon,
  Calendar01Icon,
  Cancel02Icon,
  CheckmarkCircle01Icon,
  Clock03Icon,
  FilterIcon,
  LandmarkIcon,
  Search01Icon,
  TaskDone01Icon,
  Wallet02Icon,
} from '@hugeicons/core-free-icons'

const initialCheques = [
  {
    id: 'CHQ-001',
    chequeNumber: '000431',
    bank: 'GCB Bank',
    accountName: 'Kulobal Ventures',
    payer: 'Boat Herbal Ventures',
    amount: 4250.0,
    issueDate: '2026-03-20',
    dueDate: '2026-04-08',
    status: 'pending',
    note: 'Invoice settlement for March supply',
  },
  {
    id: 'CHQ-002',
    chequeNumber: '000517',
    bank: 'Ecobank Ghana',
    accountName: 'StorePro Retail',
    payer: 'City Mart Kumasi',
    amount: 9800.0,
    issueDate: '2026-03-14',
    dueDate: '2026-03-30',
    status: 'cleared',
    note: 'Quarterly wholesale payment',
  },
  {
    id: 'CHQ-003',
    chequeNumber: '000522',
    bank: 'Absa Bank Ghana',
    accountName: 'StorePro Retail',
    payer: 'Northline Pharmacy',
    amount: 3150.0,
    issueDate: '2026-03-11',
    dueDate: '2026-03-25',
    status: 'returned',
    note: 'Returned due to signature mismatch',
  },
  {
    id: 'CHQ-004',
    chequeNumber: '000601',
    bank: 'Fidelity Bank',
    accountName: 'StorePro Retail',
    payer: 'Apex Distributors',
    amount: 5400.0,
    issueDate: '2026-04-01',
    dueDate: '2026-04-15',
    status: 'deposited',
    note: 'Deposited and awaiting clearance',
  },
]

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  deposited: 'bg-blue-100 text-blue-700',
  cleared: 'bg-emerald-100 text-emerald-700',
  returned: 'bg-red-100 text-red-700',
}

const ChequeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredCheques = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return initialCheques.filter((cheque) => {
      const matchesSearch = !query || [
        cheque.chequeNumber,
        cheque.bank,
        cheque.accountName,
        cheque.payer,
        cheque.note,
      ].some((value) => (value || '').toLowerCase().includes(query))

      const matchesStatus = statusFilter === 'all' || cheque.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const summary = useMemo(() => {
    return initialCheques.reduce(
      (accumulator, cheque) => {
        accumulator.total += cheque.amount
        accumulator[cheque.status] += cheque.amount
        return accumulator
      },
      { total: 0, pending: 0, deposited: 0, cleared: 0, returned: 0 },
    )
  }, [])

  const counts = useMemo(() => {
    return initialCheques.reduce(
      (accumulator, cheque) => {
        accumulator[cheque.status] += 1
        return accumulator
      },
      { pending: 0, deposited: 0, cleared: 0, returned: 0 },
    )
  }, [])

  const formatCurrency = (value) => `₵${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const today = new Date().toISOString().slice(0, 10)
  const overdueCount = initialCheques.filter((cheque) => cheque.status !== 'cleared' && cheque.status !== 'returned' && cheque.dueDate < today).length

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={LandmarkIcon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Cheque Management</h1>
                <p className="text-gray-500 text-xs">Track issued, deposited, cleared, and returned cheques.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <HIcon icon={TaskDone01Icon} size={16} className="text-primary-500"  />
              Banked instruments overview
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.total)}</p>
              </div>
              <HIcon icon={Wallet02Icon} size={20} className="text-primary-500"  />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
              </div>
              <HIcon icon={Clock03Icon} size={20} className="text-amber-500"  />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deposited</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{counts.deposited}</p>
              </div>
              <HIcon icon={Calendar01Icon} size={20} className="text-blue-500"  />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cleared</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.cleared}</p>
              </div>
              <HIcon icon={CheckmarkCircle01Icon} size={20} className="text-emerald-500"  />
            </div>
          </div>

          <div className="rounded-lg border border-red-200 p-4 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Attention</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{overdueCount + counts.returned}</p>
              </div>
              <HIcon icon={Alert02Icon} size={20} className="text-red-500"  />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <HIcon icon={Search01Icon} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"  />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by cheque number, bank, payer, or note..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
              />
            </div>
            <div className="relative">
              <HIcon icon={FilterIcon} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"  />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white text-sm appearance-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="deposited">Deposited</option>
                <option value="cleared">Cleared</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(counts).map(([status, count]) => (
              <span key={status} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${statusStyles[status]}`}>
                <span className="capitalize">{status}</span>
                <span>{count}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredCheques.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <HIcon icon={LandmarkIcon} size={40} className="mx-auto mb-3 text-gray-300"  />
              <p className="font-medium">No cheques found</p>
              <p className="text-sm mt-1">Try adjusting your search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Cheque</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Payer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Bank</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Dates</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCheques.map((cheque) => {
                    const isOverdue = cheque.status !== 'cleared' && cheque.status !== 'returned' && cheque.dueDate < today
                    return (
                      <tr key={cheque.id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <div>
                            <p className="font-semibold text-gray-900">#{cheque.chequeNumber}</p>
                            <p className="text-xs text-gray-500 mt-1">{cheque.accountName}</p>
                            {cheque.note && <p className="text-xs text-gray-400 mt-1">{cheque.note}</p>}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top text-sm text-gray-700">{cheque.payer}</td>
                        <td className="py-4 px-4 align-top text-sm text-gray-700">{cheque.bank}</td>
                        <td className="py-4 px-4 align-top">
                          <div className="text-sm text-gray-700">Issued: {cheque.issueDate}</div>
                          <div className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            Due: {cheque.dueDate}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top text-right font-semibold text-gray-900">{formatCurrency(cheque.amount)}</td>
                        <td className="py-4 px-4 align-top">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusStyles[cheque.status]}`}>
                            {cheque.status === 'cleared' && <HIcon icon={CheckmarkCircle01Icon} size={12}  />}
                            {cheque.status === 'pending' && <HIcon icon={Clock03Icon} size={12}  />}
                            {cheque.status === 'returned' && <HIcon icon={Cancel02Icon} size={12}  />}
                            {cheque.status === 'deposited' && <HIcon icon={Calendar01Icon} size={12}  />}
                            {cheque.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChequeManagement
