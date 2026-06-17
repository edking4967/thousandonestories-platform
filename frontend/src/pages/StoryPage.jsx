import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import VoteButton from '../components/VoteButton'

export default function StoryPage() {
  const { communityId, storyId } = useParams()
  const [community, setCommunity] = useState(null)
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/communities/${communityId}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => {
        setCommunity(data)
        const found = data.stories.find(s => s.id === storyId)
        if (!found) throw new Error('Story not found')
        setStory(found)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [communityId, storyId])

  if (loading) return (
    <div style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#9ca3af' }}>
      Loading&hellip;
    </div>
  )
  if (error) return (
    <div style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#fca5a5' }}>
      Story not found.
    </div>
  )

  return (
    <main style={{ padding: '40px 40px 80px' }}>
      {/* Back link */}
      <Link
        to={`/c/${communityId}`}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-10"
      >
        &larr; {community.name}
      </Link>

      {/* Story header */}
      <div style={{ marginBottom: '36px', paddingBottom: '28px', borderBottom: '1px solid #e8ecf0' }}>
        {story.image_url && (
          <img src={story.image_url} alt="" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block', marginBottom: '28px' }} />
        )}
        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '16px' }}>
          {community.name}
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.2, marginBottom: '16px' }}>
          {story.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
          {!community.hide_authors && <span style={{ fontWeight: 500, color: '#374151' }}>{story.author}</span>}
          {story.word_count && <span>{story.word_count.toLocaleString()} words</span>}
          {story.date_published && <span>{story.date_published}</span>}
          {story.votes != null && <VoteButton communityId={communityId} storyId={storyId} initialVotes={story.votes} />}
        </div>
      </div>

      {/* Story body */}
      <div style={{ maxWidth: '640px' }}>
        {(story.body ? story.body : story.excerpt).split('\n').filter(p => p.trim()).map((para, i) => (
          <p key={i} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', lineHeight: 1.8, color: '#1a1a1a', fontWeight: 400, marginBottom: '1.4em' }}>
            {para}
          </p>
        ))}
      </div>
    </main>
  )
}
