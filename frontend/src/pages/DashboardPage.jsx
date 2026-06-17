import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

const label = {
  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px',
  borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '16px',
}

function SubmissionCard({ sub, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [acting, setActing] = useState(false)

  function act(fn) {
    setActing(true)
    fn().finally(() => setActing(false))
  }

  return (
    <div style={{ borderBottom: '1px solid #e8ecf0', paddingTop: '24px', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#0f1923', marginBottom: '4px' }}>
            {sub.title}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
            {sub.author_name} &nbsp;·&nbsp; <a href={`mailto:${sub.author_email}`} style={{ color: '#64748b' }}>{sub.author_email}</a>
          </p>
          {sub.cover_note && (
            <p style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic', marginBottom: '8px', maxWidth: '540px' }}>
              "{sub.cover_note}"
            </p>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ fontSize: '12px', color: '#1c2b4a', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {expanded ? 'Hide story' : 'Read story'}
          </button>
          {expanded && (
            <div style={{ marginTop: '16px', maxWidth: '580px', borderLeft: '2px solid #e8ecf0', paddingLeft: '16px' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', lineHeight: 1.8, color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>
                {sub.body}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => act(onAccept)}
            disabled={acting}
            style={{ fontSize: '13px', fontWeight: 500, color: '#fff', background: '#0f1923', border: 'none', padding: '7px 18px', cursor: acting ? 'default' : 'pointer', opacity: acting ? 0.5 : 1 }}
          >
            Accept
          </button>
          <button
            onClick={() => act(onReject)}
            disabled={acting}
            style={{ fontSize: '13px', color: '#64748b', background: 'none', border: '1px solid #d1d5db', padding: '7px 18px', cursor: acting ? 'default' : 'pointer', opacity: acting ? 0.5 : 1 }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

function PublishedRow({ story }) {
  return (
    <div style={{ borderBottom: '1px solid #e8ecf0', paddingTop: '18px', paddingBottom: '18px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
      <div>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', fontWeight: 600, color: '#0f1923' }}>{story.title}</span>
        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>{story.author}</span>
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
        {story.votes} rec · {story.date_published}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { id } = useParams()
  const [community, setCommunity] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`/api/communities/${id}`).then(r => r.json()),
      fetch(`/api/communities/${id}/submissions`).then(r => r.json()),
    ]).then(([comm, subs]) => {
      setCommunity(comm)
      setSubmissions(subs)
      setLoading(false)
    })
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  function handleAccept(submissionId) {
    return fetch(`/api/communities/${id}/submissions/${submissionId}/accept`, { method: 'POST' })
      .then(() => fetchData())
  }

  function handleReject(submissionId) {
    return fetch(`/api/communities/${id}/submissions/${submissionId}/reject`, { method: 'POST' })
      .then(() => fetchData())
  }

  if (loading) return (
    <div style={{ padding: '96px 40px', fontSize: '14px', color: '#9ca3af' }}>Loading&hellip;</div>
  )

  return (
    <main style={{ padding: '40px 40px 80px' }}>
      <Link to={`/c/${id}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-10">
        &larr; {community.name}
      </Link>

      <div style={{ marginBottom: '40px' }}>
        <p style={label}>Editor dashboard</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1 }}>
          {community.name}
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
          Ed. {community.editor.name} &nbsp;·&nbsp; {community.stories.length} {community.stories.length === 1 ? 'story' : 'stories'} published
        </p>
      </div>

      {/* Submissions */}
      <section style={{ marginBottom: '56px' }}>
        <p style={label}>
          Submissions {submissions.length > 0 && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '11px', color: '#64748b', borderBottom: 'none', paddingBottom: 0 }}>({submissions.length})</span>}
        </p>
        {submissions.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>No pending submissions.</p>
        ) : (
          submissions.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              onAccept={() => handleAccept(sub.id)}
              onReject={() => handleReject(sub.id)}
            />
          ))
        )}
      </section>

      {/* Published */}
      <section>
        <p style={label}>Published</p>
        {community.stories.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>No stories published yet.</p>
        ) : (
          community.stories.map(story => (
            <PublishedRow key={story.id} story={story} />
          ))
        )}
      </section>
    </main>
  )
}
