import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const Profile = () => {
  return (
    <div className="profile-page">
      <h1>Perfil</h1>
      <Card title="Perfil de usuario">
        <p>La interfaz de gestion de perfil se implementara aqui.</p>
        <Button variant="primary">Editar perfil</Button>
      </Card>
    </div>
  )
}

export default Profile
