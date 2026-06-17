import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CommunityCard from '../components/CommunityCard'

// Fixed grid slot positions — shape never changes
const SLOTS = [
  { col: '1 / span 2', row: '1 / span 2' },
  { col: '3',          row: '1'           },
  { col: '4',          row: '1'           },
  { col: '3',          row: '2'           },
  { col: '4',          row: '2'           },
  { col: '1',          row: '3'           },
  { col: '2',          row: '3'           },
  { col: '3 / span 2', row: '3'           },
]

export default function HomePage() {
  const [communities, setCommunities] = useState([])
  const [heroStories, setHeroStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/communities').then(r => r.json()),
      fetch('http://localhost:8000/api/stories/recent?limit=8').then(r => r.json()),
    ]).then(([comms, recent]) => {
      setCommunities(comms)
      setHeroStories(recent)
      setLoading(false)
    })
  }, [])

  return (
    <>
      {/* Full-bleed image mosaic */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        height: '85vh',
        minHeight: '520px',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '3px',
        background: '#0f1923',
        overflow: 'hidden',
      }}>
        {SLOTS.map((slot, i) => {
          const story = heroStories[i]

          // Empty slot — dark placeholder
          if (!story) {
            return (
              <div
                key={i}
                style={{ gridColumn: slot.col, gridRow: slot.row, background: '#0f1923' }}
              />
            )
          }

          const cellContent = story.image_url ? (
            <img
              src={story.image_url}
              alt={story.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transition: 'transform 0.35s ease',
              }}
            />
          ) : (
            <div className="hero-quote-card">
              <span className="hero-quote-mark">&ldquo;</span>
              <p className="hero-quote-text">{story.excerpt}</p>
            </div>
          )

          return (
            <Link
              key={story.id}
              to={`/c/${story.community_id}/s/${story.id}`}
              style={{ gridColumn: slot.col, gridRow: slot.row, overflow: 'hidden', display: 'block', position: 'relative' }}
              className={`hero-cell${story.image_url ? '' : ' hero-cell--quote'}`}
            >
              {cellContent}
              <div className="hero-cell-label">
                <span className="hero-cell-title">{story.title}</span>
                {story.author && (
                  <span className="hero-cell-author">by {story.author}</span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Gradient scrim */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,15,25,0.08) 0%, rgba(10,15,25,0.5) 55%, rgba(10,15,25,0.93) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Site title */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 48px 52px',
          zIndex: 2,
        }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 0.92,
            letterSpacing: '-1.5px',
            marginBottom: '14px',
          }}>
            thousand<br />one stories
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.73rem',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            A thousand and one short stories
          </p>
        </div>
      </div>

      {/* Communities list */}
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
    </>
  )
}
