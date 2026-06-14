import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const field = {
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' },
  input: { width: '100%', border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
}

export default function NewCommunityPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', tagline: '', description: '', editor_name: '', editor_bio: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    fetch('http://localhost:8000/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(r => {
        if (r.status === 409) throw new Error('A community with that name already exists.')
        if (!r.ok) throw new Error('Something went wrong.')
        return r.json()
      })
      .then(data => navigate(`/c/${data.id}`))
      .catch(e => {
        setError(e.message)
        setSubmitting(false)
      })
  }

  return (
    <main style={{ padding: '40px 40px 80px' }}>
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-10">
        &larr; All communities
      </Link>

      <div style={{ maxWidth: '560px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '20px' }}>
          New community
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1.2, marginBottom: '32px' }}>
          Start a community
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={field.label}>Community name</label>
            <input style={field.input} value={form.name} onChange={set('name')} required placeholder="e.g. Dark Comedy" />
          </div>

          <div>
            <label style={field.label}>Tagline <span style={{ fontWeight: 300, color: '#9ca3af' }}>— one line</span></label>
            <input style={field.input} value={form.tagline} onChange={set('tagline')} required placeholder="e.g. Funny because it hurts" />
          </div>

          <div>
            <label style={field.label}>Description</label>
            <textarea style={field.textarea} rows={4} value={form.description} onChange={set('description')} required placeholder="What kind of writing will you publish? What's the editorial vision?" />
          </div>

          <div style={{ borderTop: '1px solid #e8ecf0', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '16px' }}>
              Editor
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={field.label}>Your name</label>
                <input style={field.input} value={form.editor_name} onChange={set('editor_name')} required placeholder="Full name" />
              </div>
              <div>
                <label style={field.label}>Bio <span style={{ fontWeight: 300, color: '#9ca3af' }}>— brief</span></label>
                <textarea style={field.textarea} rows={2} value={form.editor_bio} onChange={set('editor_bio')} placeholder="One or two sentences about your editorial background" />
              </div>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ alignSelf: 'flex-start', background: '#0f1923', color: '#fff', border: 'none', padding: '10px 28px', fontSize: '14px', fontWeight: 500, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Creating…' : 'Create community'}
          </button>
        </form>
      </div>
    </main>
  )
}
