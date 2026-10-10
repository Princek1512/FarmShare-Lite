export function calculateHours(startDatetime, endDatetime) {
  const start = new Date(startDatetime)
  const end = new Date(endDatetime)
  const diffMs = end - start
  return diffMs / (1000 * 60 * 60)
}

export function calculateTotal(hours, pricePerHour) {
  return Math.round(hours * pricePerHour * 100) / 100
}
