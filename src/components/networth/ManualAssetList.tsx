'use client'

interface ManualAsset {
  id: string
  name: string
  category: string
  estimatedValue: number
  purchaseDate: string | null
  notes: string | null
}

interface ManualAssetListProps {
  assets: ManualAsset[]
  onEdit: (asset: ManualAsset) => void
  onDelete: (id: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  vehicle: 'Vehicle',
  jewelry: 'Jewelry',
  crypto: 'Crypto',
  cash: 'Cash',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  real_estate: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  vehicle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  jewelry: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  cash: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ManualAssetList({
  assets,
  onEdit,
  onDelete,
}: ManualAssetListProps) {
  if (assets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No manual assets yet. Add your first asset like property, vehicle, or jewelry.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {asset.name}
              </h4>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                  CATEGORY_COLORS[asset.category] || CATEGORY_COLORS.other
                }`}
              >
                {CATEGORY_LABELS[asset.category] || asset.category}
              </span>
            </div>
          </div>

          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatCurrency(asset.estimatedValue)}
          </p>

          {asset.purchaseDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Purchased: {formatDate(asset.purchaseDate)}
            </p>
          )}

          {asset.notes && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {asset.notes}
            </p>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => onEdit(asset)}
              className="flex-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this asset?')) {
                  onDelete(asset.id)
                }
              }}
              className="flex-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
