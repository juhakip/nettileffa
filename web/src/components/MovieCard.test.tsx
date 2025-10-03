import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MovieCard } from './MovieCard'
import type { Movie } from '../lib/schemas'
import React from 'react'

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    name: 'Test Movie',
    year: 2024,
    age_limit: 12,
    rating: 4,
    synopsis: 'A test movie synopsis',
    genres: ['Action', 'Comedy'],
    actors: [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Smith' },
    ],
    director: { firstName: 'Steven', lastName: 'Director' },
  }

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>)
  }

  it('renders movie name', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('displays movie year and age limit', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Age 12+')).toBeInTheDocument()
  })

  it('shows all genres', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Comedy')).toBeInTheDocument()
  })

  it('displays synopsis when provided', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('A test movie synopsis')).toBeInTheDocument()
  })

  it('displays director information', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText(/Steven Director/)).toBeInTheDocument()
  })

  it('displays actors information', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
  })

  it('highlights search terms in movie name', () => {
    renderWithRouter(<MovieCard movie={mockMovie} searchTerm="Test" />)
    const highlighted = screen.getByText('Test')
    expect(highlighted.tagName).toBe('MARK')
  })
})
