'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NoteForm from '@/components/NoteForm'
import NoteList from '@/components/NoteList'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'
import NoteView from '@/components/NoteView'

interface ApiNote {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)
      const response = await fetch(`/api/notes?${params.toString()}`)
      if (response.ok) {
        const data: ApiNote[] = await response.json()
        // Map snake_case to camelCase
        setNotes(data.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchNotes()
    }
  }, [authLoading, user, router, fetchNotes])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNotes()
    setRefreshing(false)
  }

  const applyFilter = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
  }

  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setAppliedStartDate('')
    setAppliedEndDate('')
  }

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

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Note
            </button>
          </div>
        </div>

        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={applyFilter}
          onClear={clearFilter}
        />

        <NoteList
          notes={notes}
          onEdit={(note) => setEditingNote(note)}
          onDelete={handleDeleteNote}
          onView={(note) => setViewingNote(note)}
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

      {viewingNote && (
        <NoteView
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={() => {
            setEditingNote(viewingNote)
            setViewingNote(null)
          }}
        />
      )}
    </div>
  )
}
