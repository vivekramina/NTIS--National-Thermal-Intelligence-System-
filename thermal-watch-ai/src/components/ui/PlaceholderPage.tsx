import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  title: string
  description: string
  stage?: string
}

export default function PlaceholderPage({ icon: Icon, title, description, stage = 'Step 2' }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Icon size={24} className="text-gray-400" />
      </div>
      <div>
        <h1 className="text-[18px] font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-[13px] text-gray-500 max-w-sm leading-relaxed">{description}</p>
      </div>
      <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        Scheduled for {stage}
      </span>
    </div>
  )
}
