import { lazy, Suspense } from 'react'
const Certificates = lazy(() => import('./Certificates'))
export default function CertificatesPage({ onBack }: { onBack: () => void }) {
  return (
    <Suspense fallback={<div style={{padding:'80px',textAlign:'center',color:'#0d3d1e'}}>Loading...</div>}>
      <Certificates onBack={onBack} />
    </Suspense>
  )
}
