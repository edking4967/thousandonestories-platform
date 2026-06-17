import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const [tags, setTags] = useState([])
  const location = useLocation()

  useEffect(() => {
    fetch('/api/tags')
      .then(r => r.json())
      .then(data => setTags(data.slice(0, 10))) // cap at 10 tags in nav
      .catch(() => {})
  }, [])

  const activeTag = location.pathname.startsWith('/tag/')
    ? decodeURIComponent(location.pathname.slice(5))
    : null

  return (
    <header style={{ borderBottom: '1.5px solid #1c2b4a', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ padding: '24px 40px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1, letterSpacing: '-0.5px', display: 'block' }}>
            thousand one stories
          </Link>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 400, color: '#1c2b4a', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '5px' }}>
            A thousand and one short stories
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: '#374151' }}>
          <a href="#" style={{ color: '#374151' }}>About</a>
          <a href="#" style={{ color: '#374151' }}>Submit</a>
          <Link to="/new-community" style={{ color: '#374151' }}>Start a community</Link>
          <Link to="/signin" style={{ color: '#374151' }}>Sign in</Link>
        </div>
      </div>

      {/* Tag nav */}
      <div style={{ padding: '0 40px 14px', display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12px', overflowX: 'auto' }}>
        <Link
          to="/"
          style={{ fontWeight: 600, color: '#1c2b4a', whiteSpace: 'nowrap', letterSpacing: '0.05em', textDecoration: 'none' }}
        >
          Stories
        </Link>
        {tags.map(({ tag }) => (
          <Link
            key={tag}
            to={`/tag/${encodeURIComponent(tag)}`}
            style={{
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              color: activeTag === tag ? '#1c2b4a' : '#374151',
              fontWeight: activeTag === tag ? 600 : 400,
            }}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </Link>
        ))}
      </div>
    </header>
  )
}
