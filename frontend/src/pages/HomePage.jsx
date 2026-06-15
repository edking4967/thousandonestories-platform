import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CommunityCard from '../components/CommunityCard'

const COMMUNITY = 'thousandone-classic'

const HERO_IMAGES = [
  { id: '1635', ext: 'jpg', col: '1 / span 2', row: '1 / span 2', title: 'The Price of Knowing' },
  { id: '1929', ext: 'jpg', col: '3',          row: '1',          title: 'Fireworks' },
  { id: '2048', ext: 'jpg', col: '4',          row: '1',          title: 'The Melody Diner on Broadway' },
  { id: '1805', ext: 'jpg', col: '3',          row: '2',          title: '1968' },
  { id: '1870', ext: 'jpg', col: '4',          row: '2',          title: 'Chiclets in Columbus Circle' },
  { id: '2121', ext: 'jpg', col: '1',          row: '3',          title: 'Soup Kitchen' },
  { id: '908',  ext: 'jpg', col: '2',          row: '3',          title: 'Lycaon' },
  { id: '1745', ext: 'jpg', col: '3 / span 2', row: '3',          title: 'Jigsaw Puzzle' },
]

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
    <>
      {/* Full-bleed image mosaic — breaks out of the 780px container */}
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
        {HERO_IMAGES.map(({ id, ext, col, row, title }) => (
          <Link
            key={id}
            to={`/c/${COMMUNITY}/s/og-${id}`}
            style={{ gridColumn: col, gridRow: row, overflow: 'hidden', display: 'block', position: 'relative' }}
            className="hero-cell"
          >
            <img
              src={`/images/og/${id}.${ext}`}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transition: 'transform 0.35s ease',
              }}
            />
            <div className="hero-cell-label">
              {title}
            </div>
          </Link>
        ))}

        {/* Dark gradient scrim — heavier at bottom so text pops */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,15,25,0.08) 0%, rgba(10,15,25,0.5) 55%, rgba(10,15,25,0.93) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Title text, bottom-left */}
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
