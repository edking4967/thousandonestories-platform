import { useState, useEffect } from 'react'
import CommunityCard from '../components/CommunityCard'

export default function HomePage() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/communities')
      .then(r => r.json())
      .then(data => {
        setCommunities(data)
        setLoading(false)
      })
  }, [])

  return (
    <main style={{ padding: '40px 40px 64px' }}>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading communities&hellip;</div>
      ) : (
        <div className="flex flex-col gap-0">
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}

      <div className="mt-16 text-center border-t border-gray-100 pt-10">
        <p className="text-gray-400 text-sm">
          One thousand and one stories, and still counting.
        </p>
      </div>
    </main>
  )
}
