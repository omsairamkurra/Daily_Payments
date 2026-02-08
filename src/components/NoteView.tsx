'use client'

import ViewModal from './ui/ViewModal'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NoteViewProps {
  note: Note
  onClose: () => void
  onEdit: () => void
}

export default function NoteView({ note, onClose, onEdit }: NoteViewProps) {
  return (
    <ViewModal title="Note Details" onClose={onClose} onEdit={onEdit}>
      <div>
        <span className="text-sm text-gray-500">Title</span>
        <p className="text-sm font-medium text-gray-900 mt-1">{note.title}</p>
      </div>
      <div>
        <span className="text-sm text-gray-500">Content</span>
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{note.content}</p>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Created</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Updated</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </ViewModal>
  )
}
