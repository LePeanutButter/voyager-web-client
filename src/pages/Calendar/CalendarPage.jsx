import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react'
import Card from '../../components/UI/Card'
import './CalendarPage.css'

const upcomingItems = [
  { id: 'evt-1', title: 'Flight to Barcelona', date: '2026-06-02', time: '08:45', location: 'BOG -> BCN', type: 'Trip' },
  { id: 'evt-2', title: 'City Food Walk', date: '2026-06-03', time: '14:00', location: 'El Born', type: 'Experience' },
  { id: 'evt-3', title: 'Community meetup', date: '2026-06-05', time: '19:30', location: 'Gothic Quarter', type: 'Community' },
]

const CalendarPage = () => {
  return (
    <div className="calendar-page page-container">
      <div className="page-header">
        <h1>Calendar</h1>
        <p>Visualiza tus actividades, viajes y planes compartidos en un solo lugar.</p>
      </div>

      <Card className="calendar-highlight" hover>
        <div className="calendar-highlight-head">
          <Sparkles size={16} />
          <span>Sugerencia IA</span>
        </div>
        <h3>Tu semana esta optimizada para movilidad urbana y experiencias sociales</h3>
        <p>Podemos reordenar tu agenda automaticamente segun clima, trafico y compatibilidad de grupo.</p>
      </Card>

      <div className="calendar-list">
        {upcomingItems.map((item) => (
          <Card key={item.id} className="calendar-item" hover>
            <div className="calendar-item-top">
              <span className="calendar-type">{item.type}</span>
              <strong>{item.title}</strong>
            </div>
            <div className="calendar-item-meta">
              <span><CalendarDays size={14} /> {item.date}</span>
              <span><Clock3 size={14} /> {item.time}</span>
              <span><MapPin size={14} /> {item.location}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="calendar-actions">
        <Link to="/travel-plans/create" className="btn btn-primary">Plan New Trip</Link>
        <Link to="/ai-assistant" className="btn btn-outline">Ask AI Assistant</Link>
      </div>
    </div>
  )
}

export default CalendarPage
