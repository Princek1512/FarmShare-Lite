import { getBookingById } from '../models/bookingModel.js'
import { createPayment, getPaymentByBooking, markPaid } from '../models/paymentModel.js'

// Simulated payment: instantly marks the booking's payment as paid and
// generates a fake transaction reference. A real gateway (e.g. Razorpay
// test mode) would replace the "mark paid" step with a signature-verified
// webhook callback instead.
export async function payForBooking(req, res) {
  try {
    const { bookingId } = req.body
    const booking = await getBookingById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    if (booking.renter_id !== req.userId) {
      return res.status(403).json({ message: 'Not your booking' })
    }
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted before payment' })
    }

    let payment = await getPaymentByBooking(bookingId)
    if (!payment) {
      await createPayment({ bookingId, amount: booking.total_amount })
      payment = await getPaymentByBooking(bookingId)
    }

    const transactionRef = `TXN-${Date.now()}`
    await markPaid(payment.id, transactionRef)
    const updated = await getPaymentByBooking(bookingId)

    res.json({ payment: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error processing payment' })
  }
}

export async function getPayment(req, res) {
  try {
    const { bookingId } = req.params
    const payment = await getPaymentByBooking(bookingId)
    res.json({ payment: payment || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching payment' })
  }
}
