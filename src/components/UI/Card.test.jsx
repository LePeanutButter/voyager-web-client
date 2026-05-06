import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card, { CardHeader, CardTitle, CardContent } from './Card'

describe('Card', () => {
  it('renders title and footer', () => {
    render(
      <Card title="T" subtitle="S" footer={<span>f</span>}>
        body
      </Card>,
    )
    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
    expect(screen.getByText('f')).toBeInTheDocument()
  })

  it('subcomponents', () => {
    render(
      <CardHeader>
        <CardTitle>CT</CardTitle>
        <CardContent>cc</CardContent>
      </CardHeader>,
    )
    expect(screen.getByText('CT')).toBeInTheDocument()
    expect(screen.getByText('cc')).toBeInTheDocument()
  })
})
