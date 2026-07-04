import { Link } from 'react-router-dom'

export default function CommunityCard({ community }) {
  const { id, name, tagline, editor, story_count, featured_story } = community

  return (
    <article className="border-b border-gray-200 py-10">
      {/* Section label */}
      <div style={{ marginBottom: '12px' }}>
        <Link
          to={`/c/${id}`}
          style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block' }}
        >
          {name}
        </Link>
        <p style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>{tagline}</p>
      </div>

      {/* Featured story */}
      {featured_story && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <Link to={`/c/${id}`}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.25, marginBottom: '6px' }}>
                {featured_story.title}
              </h2>
            </Link>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, fontWeight: 300 }}>
              {featured_story.excerpt}
            </p>
          </div>
          {featured_story.image_url && (
            <Link to={`/c/${id}`} style={{ flexShrink: 0 }}>
              <img
                src={featured_story.image_url}
                alt={featured_story.title}
                style={{ width: '120px', height: '80px', objectFit: 'cover', display: 'block' }}
              />
            </Link>
          )}
        </div>
      )}

      {/* Metadata row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#374151' }}>
        {featured_story && (
          <span style={{ fontWeight: 500 }}>{featured_story.author}</span>
        )}
        <span style={{ marginLeft: 'auto', color: '#64748b' }}>
          Ed. {editor.name} &nbsp;·&nbsp; {story_count} {story_count === 1 ? 'story' : 'stories'}
          &nbsp;&nbsp;
          <Link to={`/c/${id}`} style={{ color: '#1c2b4a' }}>Browse &rarr;</Link>
        </span>
      </div>
    </article>
  )
}
