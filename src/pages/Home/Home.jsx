import { Link } from 'react-router-dom'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import { Search, MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react'
import './Home.css'

const Home = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Smart Destinations',
      description: 'AI-powered destination recommendations based on your preferences'
    },
    {
      icon: Calendar,
      title: 'Intelligent Planning',
      description: 'Automated itinerary planning with optimal routes and timing'
    },
    {
      icon: Users,
      title: 'Community Insights',
      description: 'Connect with fellow travelers and share experiences'
    },
    {
      icon: Star,
      title: 'Personalized Service',
      description: 'Tailored recommendations that match your travel style'
    }
  ]

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Next Adventure with AI</h1>
          <p>Plan perfect trips, get intelligent recommendations, and connect with a global travel community</p>
          <div className="hero-actions">
            <Link to="/register">
              <Button variant="primary" size="large">
                Get Started Free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/ai-assistant">
              <Button variant="outline" size="large">
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
        <div className="hero-search">
          <Card>
            <div className="search-form">
              <div className="search-input">
                <Search size={20} />
                <input type="text" placeholder="Where do you want to go?" />
              </div>
              <Button variant="primary">Search Destinations</Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose TourismAI?</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} hover>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Icon size={32} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <Card>
            <div className="cta-content">
              <h2>Ready to Transform Your Travel Experience?</h2>
              <p>Join thousands of travelers using AI to plan their perfect trips</p>
              <Link to="/register">
                <Button variant="primary" size="large">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Home
