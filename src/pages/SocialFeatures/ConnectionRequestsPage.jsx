import ConnectionRequests from '../../components/ConnectionRequests/ConnectionRequests'
import './SocialFeatures.css'

/**
 * Page for Connection Requests management
 * 
 * This page demonstrates Task 3: Accept or reject connection requests
 */
const ConnectionRequestsPage = () => {
  return (
    <div className="social-features-page">
      <div className="page-header">
        <h1>Connection Requests</h1>
        <p>Manage requests from travelers who want to connect with you</p>
      </div>

      <div className="page-content">
        <ConnectionRequests />
      </div>

      <div className="page-info">
        <div className="info-card">
          <h3>Managing Requests</h3>
          <p>When travelers send you connection requests, you can:</p>
          <ul>
            <li><strong>Accept:</strong> Creates a connection and allows you to message each other</li>
            <li><strong>Reject:</strong> Declines the request and removes it from your pending list</li>
            <li><strong>Ignore:</strong> Requests remain pending until you take action</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Safety Tips</h3>
          <ul>
            <li>✅ Review profiles before accepting requests</li>
            <li>✅ Check travel plans for compatibility</li>
            <li>✅ Start with public messages before sharing personal info</li>
            <li>✅ Report any suspicious behavior</li>
            <li>✅ Trust your instincts and prioritize safety</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Benefits</h3>
          <ul>
            <li>🌍 Meet travelers with similar interests</li>
            <li>🤝 Find travel companions for your trips</li>
            <li>💬 Share tips and experiences</li>
            <li>🗺️ Plan activities together</li>
            <li>📱 Stay connected during your travels</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConnectionRequestsPage
