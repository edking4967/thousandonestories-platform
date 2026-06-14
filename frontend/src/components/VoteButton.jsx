import { useState } from 'react'

export default function VoteButton({ communityId, storyId, initialVotes }) {
  const storageKey = `voted:${communityId}:${storyId}`
  const [votes, setVotes] = useState(initialVotes ?? 0)
  const [voted, setVoted] = useState(() => !!localStorage.getItem(storageKey))

  function handleVote() {
    if (voted) return
    fetch(`http://localhost:8000/api/communities/${communityId}/stories/${storyId}/vote`, {
      method: 'POST',
    })
      .then(r => r.json())
      .then(data => setVotes(data.votes))
    setVoted(true)
    localStorage.setItem(storageKey, '1')
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        color: voted ? '#1c2b4a' : '#64748b',
        fontWeight: voted ? 500 : 400,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: voted ? 'default' : 'pointer',
      }}
    >
      <span style={{ fontSize: '11px' }}>{voted ? '♥' : '♡'}</span>
      {votes} {votes === 1 ? 'recommendation' : 'recommendations'}
    </button>
  )
}
