import React, { useState, useEffect } from 'react'
import { AlertCircle, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react'
import { disputeService } from '../../services/disputeService'
import { formatDateTime } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'

export default function CustomerDisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await disputeService.getMyDisputes()
      setDisputes(data)
      if (data.length > 0) setSelectedDispute(data[0])
      setLoading(false)
    }
    load()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedDispute) return
    try {
      await disputeService.sendMessage(selectedDispute.id, replyText.trim())
      setReplyText('')
      success('Message posted to dispute thread.')
      const updated = await disputeService.getDisputeById(selectedDispute.id)
      setSelectedDispute(updated)
    } catch {
      error('Failed to post message.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Disputes & Warranty Claims</h1>
        <p className="text-xs text-slate-500">
          Tickets raised within the 48-hour window for free rework or refund arbitration
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Open Disputes</h3>
          <p className="text-xs text-slate-500">All your completed bookings are in good standing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dispute Tickets List */}
          <div className="lg:col-span-5 space-y-3">
            {disputes.map((d) => {
              const isSelected = selectedDispute?.id === d.id
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {d.booking_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold line-clamp-2">{d.reason}</p>
                  <p className="text-[10px] text-slate-400">{formatDateTime(d.created_at)}</p>
                </div>
              )
            })}
          </div>

          {/* Conversation Thread */}
          {selectedDispute && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Dispute Thread: {selectedDispute.booking_number}
                  </h3>
                  <p className="text-[10px] text-slate-500">Super Admin Arbitration Active</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {selectedDispute.status}
                </span>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {selectedDispute.messages?.map((m) => {
                  const isMe = m.sender === 'CUSTOMER'
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-2xl space-y-1 ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p className="text-[10px] opacity-75 font-bold">
                          {isMe ? 'You' : m.sender_name || 'Admin Support'}
                        </p>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {formatDateTime(m.timestamp)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message to the support team..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
