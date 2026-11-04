import React, { useState, useEffect } from 'react'
import { Building, Phone, Mail, FileText, Upload, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { providerService } from '../../services/providerService'
import { useToast } from '../../context/ToastContext'
import StatusBadge from '../../components/ui/StatusBadge'

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await providerService.getProfile()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleUploadKyc = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('document', file)
    try {
      await providerService.uploadKyc(formData)
      success('KYC Document uploaded securely. Status changed to IN_REVIEW.')
      setProfile({ ...profile, kyc_status: 'IN_REVIEW' })
      setFile(null)
    } catch {
      error('Failed to upload document.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Profile & KYC</h1>
        <p className="text-xs text-slate-500">Legal registration details and business license compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Business Overview Card */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{profile?.business_name || 'Apex Cooling Ltd'}</h2>
                <p className="text-xs text-slate-500">Contact: {profile?.contact_number}</p>
              </div>
            </div>
            <StatusBadge type="kyc" status={profile?.kyc_status} />
          </div>

          <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-400 uppercase text-[10px] block">Company Description</span>
              <p className="text-slate-800 leading-relaxed mt-0.5">{profile?.description}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-400 uppercase text-[10px] block">Platform Membership</span>
              <p className="text-slate-800 font-medium">Verified Partner since January 2026</p>
            </div>
          </div>
        </div>

        {/* KYC Document Upload Console */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">KYC Verification Portal</h3>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
            <p className="font-bold text-slate-800">Accepted Documents:</p>
            <ul className="list-disc pl-4 text-[11px] text-slate-500 space-y-0.5">
              <li>GSTIN Registration Certificate</li>
              <li>State Municipal Trade License</li>
              <li>MSME / Udyam Registration (PDF/JPEG)</li>
            </ul>
          </div>

          <form onSubmit={handleUploadKyc} className="space-y-3 text-xs">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition cursor-pointer">
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="kyc-doc-file"
              />
              <label htmlFor="kyc-doc-file" className="cursor-pointer space-y-2 block">
                <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
                <span className="block font-semibold text-slate-700">
                  {file ? file.name : 'Choose File to Upload'}
                </span>
                <span className="block text-[10px] text-slate-400">PDF, JPG up to 10MB</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {uploading ? 'Uploading securely...' : 'Submit Document for Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
