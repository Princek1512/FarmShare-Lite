import { getEquipmentById } from '../models/equipmentModel.js'
import { hasOverlap } from '../utils/overlapCheck.js'
import { calculateHours, calculateTotal } from '../utils/pricing.js'
import {
  createBooking,
  getBookingById,
  getBookingsByRenter,
  getBookingsForOwner,
  updateBookingStatus,
} from '../models/bookingModel.js'

export async function requestBooking(req, res) {
  try {
    const { equipmentId, startDatetime, endDatetime } = req.body
    if (!equipmentId || !startDatetime || !endDatetime) {
      return res.status(400).json({ message: 'equipmentId, startDatetime, and endDatetime are required' })
    }

    const equipment = await getEquipmentById(equipmentId)
    if (!equipment || equipment.status !== 'active') {
      return res.status(404).json({ message: 'Equipment not available' })
    }

    if (equipment.owner_id === req.userId) {
      return res.status(400).json({ message: 'You cannot book your own equipment' })
    }

    const hours = calculateHours(startDatetime, endDatetime)
    if (hours <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' })
    }

    const overlap = await hasOverlap(equipmentId, startDatetime, endDatetime)
    if (overlap) {
      return res.status(409).json({ message: 'Equipment is already booked for an overlapping time' })
    }

    const totalAmount = calculateTotal(hours, equipment.price_per_hour)
    const bookingId = await createBooking({
      equipmentId,
      renterId: req.userId,
      startDatetime,
      endDatetime,
      hours,
      totalAmount,
    })

    const booking = await getBookingById(bookingId)
    res.status(201).json({ booking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error creating booking' })
  }
}

export async function myBookings(req, res) {
  try {
    const bookings = await getBookingsByRenter(req.userId)
    res.json({ bookings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching bookings' })
  }
}

export async function bookingRequests(req, res) {
  try {
    const bookings = await getBookingsForOwner(req.userId)
    res.json({ bookings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching booking requests' })
  }
}

export async function respondToBooking(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' })
    }

    const booking = await getBookingById(id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const equipment = await getEquipmentById(booking.equipment_id)
    if (equipment.owner_id !== req.userId) {
      return res.status(403).json({ message: 'Not your equipment' })
    }

    await updateBookingStatus(id, status)
    const updated = await getBookingById(id)
    res.json({ booking: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error updating booking' })
  }
}

export async function completeBooking(req, res) {
  try {
    const { id } = req.params
    const booking = await getBookingById(id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const equipment = await getEquipmentById(booking.equipment_id)
    const isRenter = booking.renter_id === req.userId
    const isOwner = equipment.owner_id === req.userId
    if (!isRenter && !isOwner) {
      return res.status(403).json({ message: 'Not part of this booking' })
    }

    await updateBookingStatus(id, 'completed')
    const updated = await getBookingById(id)
    res.json({ booking: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error completing booking' })
  }
}
