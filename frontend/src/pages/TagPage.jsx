import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function TagPage() {
  const { tag } = useParams()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stories/tag/${encodeURIComponent(tag)}`)
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false) })
  }, [tag])

  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1)

  return (
    <main style={{ padding: '40px 40px 64px' }}>
      <div style={{ marginBottom: '32px', borderBottom: '1.5px solid #1c2b4a', paddingBottom: '20px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', marginBottom: '6px' }}>
          Tag
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1 }}>
          {displayTag}
        </h1>
        {!loading && (
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
          </p>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading&hellip;</p>
      ) : stories.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>No stories with this tag yet.</p>
      ) : (
        stories.map(story => (
          <article key={story.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '28px 0' }}>
            <div style={{ marginBottom: '10px' }}>
              <Link
                to={`/c/${story.community_id}`}
                style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', borderBottom: '1.5px solid #1c2b4a', paddingBottom: '3px' }}
              >
                {story.community_id.replace(/-/g, ' ')}
              </Link>
            </div>
            <Link to={`/c/${story.community_id}/s/${story.id}`}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.25, marginBottom: '6px' }}>
                {story.title}
              </h2>
            </Link>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, fontWeight: 300, marginBottom: '10px' }}>
              {story.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#374151' }}>
              {story.author && <span style={{ fontWeight: 500 }}>{story.author}</span>}
              <span style={{ marginLeft: 'auto', color: '#64748b' }}>
                {story.word_count.toLocaleString()} words &nbsp;·&nbsp; {story.date_published}
              </span>
            </div>
          </article>
        ))
      )}
    </main>
  )
}
