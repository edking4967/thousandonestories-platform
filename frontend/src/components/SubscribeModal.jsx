export default function SubscribeModal({ community, onClose, onSubscribe }) {
  function handleSelect(tier) {
    onSubscribe(tier)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 p-8"
        style={{ border: '1px solid #e5e5e5' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Subscribe to {community.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Curated by {community.editor.name}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Free tier */}
          <button
            onClick={() => handleSelect('free')}
            className="text-left border border-gray-200 p-5 hover:border-gray-400 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900 text-sm">Free</span>
              <span className="text-xs text-gray-400 font-medium">No charge</span>
            </div>
            <p className="text-sm text-gray-500">
              Email digest when new stories are published.
            </p>
          </button>

          {/* Paid tier */}
          <button
            onClick={() => handleSelect('paid')}
            className="text-left border border-gray-900 p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900 text-sm">Supporter</span>
              <span className="text-xs font-medium text-gray-900">$4 / month</span>
            </div>
            <p className="text-sm text-gray-500">
              Everything in Free, plus exclusive stories and direct support for the editor.
            </p>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
