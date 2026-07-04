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
      fetch('/api/communities').then(r => r.json()),
      fetch('/api/stories/recent?limit=8').then(r => r.json()),
    ]).then(([comms, recent]) => {
      setCommunities(comms)
      setHeroStories(recent)
      setLoading(false)
    })
  }, [])

  return (
    <>
      {/* Splash */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        background: '#0f1923',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 48px',
        boxSizing: 'border-box',
      }}>
        {/* Left: headline */}
        <div style={{ flex: '1 1 55%', paddingRight: '48px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 0.95,
            letterSpacing: '-1.5px',
            margin: 0,
          }}>
            find your<br />writing<br />community
          </h1>
        </div>

        {/* Right: action links */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          paddingLeft: '48px',
        }}>
          {[
            { label: 'READ stories',        to: '#communities', anchor: true },
            { label: 'WRITE a story',       to: '/drafts'                    },
            { label: 'CREATE A COMMUNITY',  to: '/new-community'             },
          ].map(({ label, to, anchor }) => {
            const linkStyle = {
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              padding: '20px 0',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              transition: 'color 0.2s',
            }
            const hoverProps = {
              onMouseEnter: e => e.currentTarget.style.color = '#fff',
              onMouseLeave: e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)',
            }
            return anchor ? (
              <a key={label} href={to} style={linkStyle} {...hoverProps} onClick={e => {
                e.preventDefault()
                document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' })
              }}>{label} →</a>
            ) : (
              <Link key={label} to={to} style={linkStyle} {...hoverProps}>{label} →</Link>
            )
          })}
        </div>
      </div>

      {/* Story mosaic */}
      <div id="communities" style={{
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
          if (!story) {
            return <div key={i} style={{ gridColumn: slot.col, gridRow: slot.row, background: '#0f1923' }} />
          }
          return (
            <Link
              key={story.id}
              to={`/c/${story.community_id}/s/${story.id}`}
              style={{ gridColumn: slot.col, gridRow: slot.row, overflow: 'hidden', display: 'block', position: 'relative' }}
              className={`hero-cell${story.image_url ? '' : ' hero-cell--quote'}`}
            >
              {story.image_url ? (
                <img src={story.image_url} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.35s ease' }} />
              ) : (
                <div className="hero-quote-card">
                  <span className="hero-quote-mark">&ldquo;</span>
                  <p className="hero-quote-text">{story.excerpt}</p>
                </div>
              )}
              <div className="hero-cell-label">
                <span className="hero-cell-title">{story.title}</span>
                {story.author && <span className="hero-cell-author">by {story.author}</span>}
              </div>
            </Link>
          )
        })}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,15,25,0.08) 0%, rgba(10,15,25,0.5) 55%, rgba(10,15,25,0.93) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
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
