import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto'
  }

  return (
    <div className={`flex items-center gap-3 group transition-all duration-300 ${className}`}>
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <img
          src="/images/الشعار.jpg"
          alt="نظام إدارة المخزون"
          className={`${sizes[size]} object-contain hover:scale-105 transition-transform duration-300`}
        />
      </div>
      <div className={`font-bold ${
        size === 'sm' ? 'text-lg' :
        size === 'md' ? 'text-xl' :
        'text-2xl'
      } text-primary-600 group-hover:text-primary-700 transition-colors duration-300`}>
        نظام المخزون
      </div>
    </div>
  )
} 