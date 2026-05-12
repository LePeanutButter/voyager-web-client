const STATUS_LABELS = {
  ACTIVE: 'Activo',
  PLANNING: 'Planificando',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado'
}

const STATUS_BADGE_CLASSES = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  PLANNING: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
}

export const getTravelStatusText = (status) => STATUS_LABELS[status] || status

export const getTravelStatusBadgeClass = (status) => {
  return STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.COMPLETED
}
