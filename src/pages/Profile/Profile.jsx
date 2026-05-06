import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const Profile = () => {
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <Card title="User Profile">
        <p>Profile management interface will be implemented here.</p>
        <Button variant="primary">Edit Profile</Button>
      </Card>
    </div>
  )
}

export default Profile
