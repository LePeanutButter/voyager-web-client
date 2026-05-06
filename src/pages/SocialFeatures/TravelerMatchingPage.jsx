import TravelerMatching from '../../components/TravelerMatching/TravelerMatching'
import './SocialFeatures.css'

/**
 * Page for Traveler Matching functionality
 * 
 * This page demonstrates Task 1: Search travelers by destination and similar dates
 * and Task 2: Send connection requests
 */
const TravelerMatchingPage = () => {
  // Mock data for demonstration
  const mockTravelPlanId = '1'

  return (
    <div className="social-features-page">
      <div className="page-header">
        <h1>Find Compatible Travelers</h1>
        <p>Connect with travelers who have similar destinations and travel dates</p>
      </div>

      <div className="page-content">
        <TravelerMatching travelPlanId={mockTravelPlanId} />
      </div>

      <div className="page-info">
        <div className="info-card">
          <h3>How it works</h3>
          <ol>
            <li>Select one of your active travel plans</li>
            <li>Our system finds travelers with the same destination</li>
            <li>View compatibility scores based on overlapping dates</li>
            <li>{'Send connection requests to travelers you\u2019d like to meet'}</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>Features</h3>
          <ul>
            <li>✅ Smart matching by destination and dates</li>
            <li>✅ Compatibility scoring system</li>
            <li>✅ Detailed traveler profiles</li>
            <li>✅ Safe connection requests</li>
            <li>✅ Duplicate request prevention</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TravelerMatchingPage
