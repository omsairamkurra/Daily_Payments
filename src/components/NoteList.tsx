'use client'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NoteListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

export default function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        No notes found. Add your first note to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 text-lg truncate flex-1 mr-2">
              {note.title}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(note)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDelete(note.id)
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4">
            {note.content}
          </p>
          <p className="text-gray-400 text-xs mt-3">
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}
