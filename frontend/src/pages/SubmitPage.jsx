import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function SubmitPage() {
  const { id } = useParams()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    title: '',
    author_name: '',
    author_email: '',
    body: '',
    cover_note: '',
  })

  useEffect(() => {
    fetch(`/api/communities/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => {
        setCommunity(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [id])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ community_id: id, ...form }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#9ca3af' }}>
      Loading&hellip;
    </div>
  )
  if (error && !community) return (
    <div style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#fca5a5' }}>
      Community not found.
    </div>
  )

  if (submitted) {
    return (
      <main style={{ padding: '40px 40px 80px' }}>
        <Link
          to={`/c/${id}`}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-10"
        >
          &larr; {community.name}
        </Link>
        <div style={{ maxWidth: '480px', paddingTop: '24px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '20px' }}>
            Received
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.25, marginBottom: '12px' }}>
            Your story has been received.
          </h1>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
            The editor will be in touch.
          </p>
        </div>
      </main>
    )
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #d1d5db',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    letterSpacing: '0.03em',
  }

  return (
    <main style={{ padding: '40px 40px 80px' }}>
      <Link
        to={`/c/${id}`}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-10"
      >
        &larr; {community.name}
      </Link>

      <div style={{ maxWidth: '560px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '16px' }}>
          {community.name}
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.25, marginBottom: '6px' }}>
          Submit a story
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '32px' }}>
          Edited by {community.editor.name}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle} htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Story title"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="author_name">Your name</label>
            <input
              id="author_name"
              name="author_name"
              type="text"
              required
              value={form.author_name}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Full name"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="author_email">Your email</label>
            <input
              id="author_email"
              name="author_email"
              type="email"
              required
              value={form.author_email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="body">Story</label>
            <textarea
              id="body"
              name="body"
              required
              value={form.body}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '320px', resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Paste your story here&hellip;"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="cover_note">
              Cover note <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
            </label>
            <textarea
              id="cover_note"
              name="cover_note"
              value={form.cover_note}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
              placeholder="A brief note to the editor&hellip;"
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors px-6 py-2.5 self-start disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit story'}
          </button>
        </form>
      </div>
    </main>
  )
}
