import React, { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onError: (error: string) => void
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 100,
      },
      fps: 5,
    }, false) // Add the missing verbose parameter

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        scanner.clear()
      },
      (error) => {
        onError(typeof error === 'string' ? error : (error as Error).message || 'خطأ في قراءة الباركود')
      }
    )

    return () => {
      scanner.clear()
    }
  }, [onScan, onError])

  return (
    <div>
      <div id="reader"></div>
    </div>
  )
} 