import React from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react'

const Social = () => {
  return (
    <div className="social-page">
      <h1>Community</h1>
      <Card title="Travel Community">
        <p>Social features and community interaction will be implemented here.</p>
        <Button variant="primary">Join Community</Button>
      </Card>
    </div>
  )
}

export default Social
