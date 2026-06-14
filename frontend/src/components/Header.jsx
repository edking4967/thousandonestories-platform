import { Link } from 'react-router-dom'

const genres = ['Literary', 'Thriller', 'Humor', 'Mystery', 'Romance', 'Sci-Fi']

export default function Header() {
  return (
    <header style={{ borderBottom: '1.5px solid #1c2b4a', background: '#fff' }}>
      {/* Top bar: logo + actions */}
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
      {/* Genre nav */}
      <div style={{ padding: '0 40px 14px', display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12px', color: '#374151', overflowX: 'auto' }}>
        <a href="#" style={{ fontWeight: 600, color: '#1c2b4a', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Stories</a>
        {genres.map(g => (
          <a key={g} href="#" style={{ color: '#374151', whiteSpace: 'nowrap' }}>{g}</a>
        ))}
      </div>
    </header>
  )
}
