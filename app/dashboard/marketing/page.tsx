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


    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <span className="text-lg md:text-2xl font-cormorant text-muted-foreground">
          Use sidebar or <kbd className="px-2 py-1 rounded bg-muted text-sm font-mono">Ctrl + K</kbd>
        </span>
      </motion.div>
    </div>

  )
}
