import { useState, useEffect, useCallback } from 'react'

const label = {
  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px',
  borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '16px',
}

const SOURCE_LABELS = { og: 'oldthous', cbr: 'coffeebreakreads' }

function DraftRow({ story, onPublish }) {
  const [publishing, setPublishing] = useState(false)

  function handlePublish() {
    setPublishing(true)
    onPublish(story.id).finally(() => setPublishing(false))
  }

  return (
    <div style={{
      borderBottom: '1px solid #e8ecf0',
      padding: '16px 0',
      display: 'flex',
      alignItems: 'baseline',
      gap: '16px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '1.05rem', fontWeight: 600, color: '#0f1923',
          marginRight: '10px',
        }}>
          {story.title}
        </span>
        {story.author && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>{story.author}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexShrink: 0, fontSize: '12px', color: '#9ca3af' }}>
        <span style={{
          padding: '2px 7px',
          background: story.source === 'og' ? '#eef2ff' : '#f0fdf4',
          color: story.source === 'og' ? '#4338ca' : '#16a34a',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: 500,
        }}>
          {SOURCE_LABELS[story.source] || story.source}
        </span>
        <span>{story.word_count.toLocaleString()} words</span>
        <span>{story.date_published}</span>
        <span style={{ color: story.image_url ? '#16a34a' : '#d1d5db' }}>
          {story.image_url ? '● img' : '○ no img'}
        </span>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            fontSize: '12px', fontWeight: 500, color: '#fff',
            background: publishing ? '#94a3b8' : '#0f1923',
            border: 'none', padding: '5px 14px',
            cursor: publishing ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {publishing ? 'Publishing…' : 'Publish now'}
        </button>
      </div>
    </div>
  )
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDrafts = useCallback(() => {
    const url = filter === 'all'
      ? 'http://localhost:8000/api/stories/drafts'
      : `http://localhost:8000/api/stories/drafts?source=${filter}`
    fetch(url)
      .then(r => r.json())
      .then(data => { setDrafts(data); setLoading(false) })
  }, [filter])

  useEffect(() => { fetchDrafts() }, [fetchDrafts])

  function handlePublish(storyId) {
    return fetch(`http://localhost:8000/api/stories/${storyId}/publish`, { method: 'POST' })
      .then(() => fetchDrafts())
  }

  const visible = drafts.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.author || '').toLowerCase().includes(search.toLowerCase())
  )

  const ogCount  = drafts.filter(s => s.source === 'og').length
  const cbrCount = drafts.filter(s => s.source === 'cbr').length

  return (
    <main style={{ padding: '40px 40px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={label}>Draft queue</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1, marginBottom: '8px' }}>
          Unpublished stories
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          {drafts.length} drafts total &nbsp;·&nbsp;
          <span style={{ color: '#4338ca' }}>{ogCount} oldthous</span>
          &nbsp;·&nbsp;
          <span style={{ color: '#16a34a' }}>{cbrCount} coffeebreakreads</span>
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'og', 'cbr'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: '12px', fontWeight: 500, padding: '6px 14px',
              border: '1px solid',
              borderColor: filter === f ? '#1c2b4a' : '#d1d5db',
              background: filter === f ? '#1c2b4a' : '#fff',
              color: filter === f ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? 'All' : f === 'og' ? 'oldthous' : 'coffeebreakreads'}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search title or author…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto', fontSize: '13px', padding: '6px 12px',
            border: '1px solid #d1d5db', outline: 'none', width: '220px',
          }}
        />
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading&hellip;</p>
      ) : visible.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>
          {search ? 'No matches.' : 'Draft queue is empty.'}
        </p>
      ) : (
        <>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', borderBottom: '1px solid #e8ecf0', paddingBottom: '8px', marginBottom: '4px' }}>
            <span style={{ flex: 1 }}>Title / Author</span>
            <span style={{ width: '110px', textAlign: 'right' }}>Source</span>
            <span style={{ width: '72px', textAlign: 'right' }}>Words</span>
            <span style={{ width: '88px', textAlign: 'right' }}>Original date</span>
            <span style={{ width: '52px', textAlign: 'right' }}>Image</span>
            <span style={{ width: '96px' }}></span>
          </div>
          {visible.map(story => (
            <DraftRow key={story.id} story={story} onPublish={handlePublish} />
          ))}
        </>
      )}
    </main>
  )
}
