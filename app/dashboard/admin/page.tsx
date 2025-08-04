"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import {
  fetchApprovalRequests,
  processApprovalRequest,
  fetchAdminStats,
  selectApprovalRequests,
  selectAdminStats,
  selectAdminLoading,
  selectAdminError,
} from '@/lib/redux/features/adminSlice'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const approvalRequests = useSelector(selectApprovalRequests)
  const stats = useSelector(selectAdminStats)
  const isLoading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)

  useEffect(() => {
    dispatch(fetchApprovalRequests())
    dispatch(fetchAdminStats())
  }, [dispatch])

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/approvals/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          notes: ''
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errorMessage || 'Failed to process request');
      }
      
      toast.success(
        approved ? 'Request approved successfully' : 'Request rejected successfully'
      )
      
      // Refresh data
      dispatch(fetchApprovalRequests())
      dispatch(fetchAdminStats())
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.hotelsPending}</p>
              <p className="text-sm text-gray-500">Hotels</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.vendorsPending}</p>
              <p className="text-sm text-gray-500">Vendors</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.usersPending}</p>
              <p className="text-sm text-gray-500">Users</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.totalPending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalApproved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                dispatch(fetchApprovalRequests())
                dispatch(fetchAdminStats())
              }}
            >
              Refresh Data
            </Button>
          </div>
        </Card>
      </div>

      {/* Approval Requests Table */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Pending Approval Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Business Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvalRequests
                .filter(request => request.status === 'pending')
                .map(request => (
                  <tr key={request.id} className="border-b">
                    <td className="px-4 py-2">
                      {request.metadata.businessName || 'N/A'}
                    </td>
                    <td className="px-4 py-2 capitalize">
                      {request.entityType}
                    </td>
                    <td className="px-4 py-2">
                      {request.metadata.email}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproval(request.id, true)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(request.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
