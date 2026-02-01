'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NoteForm from '@/components/NoteForm'
import NoteList from '@/components/NoteList'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchNotes()
    }
  }, [status, router, fetchNotes])

  const handleAddNote = async (data: { title: string; content: string }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchNotes()
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleEditNote = async (data: { title: string; content: string }) => {
    if (!editingNote) return

    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingNote.id, ...data }),
      })

      if (response.ok) {
        setEditingNote(null)
        fetchNotes()
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchNotes()
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Note
          </button>
        </div>

        <NoteList
          notes={notes}
          onEdit={(note) => setEditingNote(note)}
          onDelete={handleDeleteNote}
        />
      </main>

      {showForm && (
        <NoteForm
          onSubmit={handleAddNote}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingNote && (
        <NoteForm
          note={editingNote}
          onSubmit={handleEditNote}
          onCancel={() => setEditingNote(null)}
        />
      )}
    </div>
  )
}
