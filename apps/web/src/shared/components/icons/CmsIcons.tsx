import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * Custom SVG Icon Suite for Teacher CMS & Admin CMS Navigation and Dashboards.
 */

export function CmsOverviewIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="#6C5CE7" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" fill="#00CEC9" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="#FF7675" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" fill="#FDCB6E" />
    </svg>
  )
}

export function CmsClassesIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M4 19V7L12 3L20 7V19H4Z" fill="#74B9FF" stroke="#0984E3" strokeWidth="1.2" />
      <rect x="9" y="12" width="6" height="7" rx="1" fill="#FFEAA7" />
      <circle cx="12" cy="8" r="1.5" fill="#FFFFFF" />
    </svg>
  )
}

export function CmsCoursesIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M4 5C4 3.9 4.9 3 6 3H19V18H6C4.9 18 4 17.1 4 16V5Z" fill="#A29BFE" stroke="#6C5CE7" strokeWidth="1.2" />
      <path d="M4 18C4 16.9 4.9 16 6 16H19V21H6C4.9 21 4 20.1 4 19V18Z" fill="#6C5CE7" />
      <line x1="8" y1="7" x2="15" y2="7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="11" x2="13" y2="11" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function CmsLecturesIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="3" y="4" width="18" height="13" rx="3" fill="#FF7675" stroke="#D63031" strokeWidth="1.2" />
      <path d="M10 8.5L16 11.5L10 14.5V8.5Z" fill="#FFFFFF" />
      <path d="M8 20H16" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17V20" stroke="#2D3436" strokeWidth="2" />
    </svg>
  )
}

export function CmsAnalyticsIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M3 19L8.5 13.5L12.5 16.5L21 6" stroke="#00CEC9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="6" r="2" fill="#00B894" />
      <path d="M17 6H21V10" stroke="#00CEC9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CmsLogsIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="5" y="10" width="14" height="11" rx="3" fill="#FDCB6E" stroke="#E1B12C" strokeWidth="1.2" />
      <path d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10" stroke="#E1B12C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.5" fill="#2D3436" />
    </svg>
  )
}

export function CmsSessionsIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="8" cy="12" r="3" stroke="#6C5CE7" strokeWidth="2" />
      <path d="M11 12H20M16 9V15" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CmsUsersIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="9" cy="8" r="4" fill="#74B9FF" />
      <path d="M3 19C3.5 15 6 13.5 9 13.5C12 13.5 14.5 15 15 19" fill="#74B9FF" />
      <circle cx="17" cy="9" r="3" fill="#A29BFE" />
      <path d="M14 19C14.3 16.5 16 15 18 15C20 15 21.7 16.5 22 19" fill="#A29BFE" />
    </svg>
  )
}

export function CmsAiIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="4" y="6" width="16" height="13" rx="4" fill="#6C5CE7" stroke="#4834D4" strokeWidth="1.2" />
      <circle cx="9" cy="11.5" r="2" fill="#55E6C1" />
      <circle cx="15" cy="11.5" r="2" fill="#55E6C1" />
      <path d="M10.5 15.5H13.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="#6C5CE7" strokeWidth="2" />
      <circle cx="12" cy="2" r="1.5" fill="#FF7675" />
    </svg>
  )
}

export function CmsOperationsIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="4" y="4" width="16" height="17" rx="3" fill="#A29BFE" stroke="#6C5CE7" strokeWidth="1.2" />
      <rect x="8" y="2.5" width="8" height="4" rx="2" fill="#6C5CE7" />
      <path d="M8 11L10 13L14 9" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 17H16" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function CmsScheduleIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" fill="#74B9FF" stroke="#0984E3" strokeWidth="1.2" />
      <path d="M3 10H21" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M8 3V7M16 3V7" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="15" r="2" fill="#FDCB6E" />
      <path d="M14 14H18M14 17H17" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function CmsAssessmentIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M5 4.5C5 3.7 5.7 3 6.5 3H18C18.6 3 19 3.4 19 4V20C19 20.6 18.6 21 18 21H6.5C5.7 21 5 20.3 5 19.5V4.5Z" fill="#FDCB6E" stroke="#E1B12C" strokeWidth="1.2" />
      <path d="M8 8H16M8 12H13" stroke="#6C5CE7" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.5 16.5L15.2 18.2L18.5 14.8" stroke="#00B894" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CmsSettingsIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="4" fill="#74B9FF" stroke="#0984E3" strokeWidth="1.2" />
      <path d="M12 3V6M12 18V21M3 12H6M18 12H21M5.6 5.6L7.7 7.7M16.3 16.3L18.4 18.4M18.4 5.6L16.3 7.7M7.7 16.3L5.6 18.4" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
    </svg>
  )
}
