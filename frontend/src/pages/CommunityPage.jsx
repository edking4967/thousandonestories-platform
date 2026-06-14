import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SubscribeModal from '../components/SubscribeModal'
import VoteButton from '../components/VoteButton'

function StoryRow({ story, featured, communityId }) {
  return (
    <article style={{ borderBottom: '1px solid #e8ecf0', paddingTop: '28px', paddingBottom: '28px' }}>
      {featured && (
        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '5px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '12px' }}>
          Featured story
        </p>
      )}
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, color: '#0f1923', lineHeight: 1.25, marginBottom: '6px', fontSize: featured ? '1.5rem' : '1.2rem' }}>
        <Link to={`/c/${communityId}/s/${story.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
          {story.title}
        </Link>
      </h2>
      <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, fontWeight: 300, marginBottom: '10px', maxWidth: '520px' }}>
        {story.excerpt}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b' }}>
        <span style={{ fontWeight: 500, color: '#374151' }}>{story.author}</span>
        {story.word_count && <span>{story.word_count.toLocaleString()} words</span>}
        <span>{story.date_published}</span>
        <VoteButton communityId={communityId} storyId={story.id} initialVotes={story.votes} />
      </div>
    </article>
  )
}

export default function CommunityPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [subscription, setSubscription] = useState(null) // null | { tier: 'free'|'paid' }

  useEffect(() => {
    fetch(`http://localhost:8000/api/communities/${id}`)
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

  if (loading) return (
    <div
      className="max-w-3xl mx-auto text-gray-400"
      style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}
    >
      Loading&hellip;
    </div>
  )
  if (error) return (
    <div
      className="max-w-3xl mx-auto text-red-300"
      style={{ padding: '96px 40px', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}
    >
      Community not found.
    </div>
  )

  function handleSubscribe(tier) {
    setSubscription({ tier })
    // TODO: POST /api/communities/${id}/subscribe with auth token
  }

  function handleUnsubscribe() {
    setSubscription(null)
    // TODO: DELETE /api/communities/${id}/subscribe
  }

  const featured = community.stories.find(s => s.featured)
  const rest = community.stories.filter(s => !s.featured)

  return (
    <main style={{ padding: '40px 40px 64px' }}>
      {/* Back */}
      <Link
        to="/"
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors block mb-8"
      >
        &larr; All communities
      </Link>

      {/* Community header */}
      <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #e8ecf0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#0f1923', lineHeight: 1 }}>{community.name}</h1>

          {/* Subscribe CTA */}
          {subscription ? (
            <div className="shrink-0 flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {subscription.tier === 'paid' ? 'Supporter' : 'Subscribed'} &mdash; {subscription.tier === 'paid' ? '$4/mo' : 'free'}
              </span>
              <button
                onClick={handleUnsubscribe}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline"
              >
                Unsubscribe
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors px-5 py-2"
            >
              Subscribe
            </button>
          )}
        </div>

        <p className="text-gray-500 leading-relaxed mb-6" style={{ maxWidth: '600px' }}>
          {community.description}
        </p>

        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1c2b4a', paddingBottom: '4px', borderBottom: '1.5px solid #1c2b4a', display: 'inline-block', marginBottom: '6px' }}>
              Editor
            </p>
            <p style={{ fontWeight: 500, fontSize: '13px', color: '#111827' }}>{community.editor.name}</p>
            {community.editor.bio && (
              <p style={{ fontSize: '12px', color: '#374151', maxWidth: '320px', marginTop: '3px', fontWeight: 300 }}>{community.editor.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {community.subscriber_count > 0 && (
              <span>{community.subscriber_count.toLocaleString()} {community.subscriber_count === 1 ? 'subscriber' : 'subscribers'}</span>
            )}
            <button
              onClick={() => navigate(`/c/${id}/submit`)}
              className="text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-500 transition-colors px-4 py-1.5"
            >
              Submit a story
            </button>
            <Link
              to={`/c/${id}/dashboard`}
              className="text-gray-400 hover:text-gray-700 transition-colors text-xs"
            >
              Editor dashboard
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <SubscribeModal
          community={community}
          onClose={() => setShowModal(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* Stories */}
      <div>
        {featured && <StoryRow story={featured} featured={true} communityId={id} />}
        {rest.map(story => (
          <StoryRow key={story.id} story={story} featured={false} communityId={id} />
        ))}
      </div>
    </main>
  )
}
