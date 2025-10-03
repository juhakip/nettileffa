import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MovieCard } from './MovieCard'
import type { Movie } from '../lib/schemas'

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    name: 'Test Movie',
    year: 2024,
    age_limit: 12,
    rating: 4,
    synopsis: 'A test movie synopsis',
    genres: ['Action', 'Comedy'],
  }

  it('renders movie name', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('displays movie year and age limit', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Age 12+')).toBeInTheDocument()
  })

  it('shows all genres', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Comedy')).toBeInTheDocument()
  })

  it('displays synopsis when provided', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('A test movie synopsis')).toBeInTheDocument()
  })
})
