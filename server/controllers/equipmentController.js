import {
  createEquipment,
  getEquipmentByOwner,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  searchEquipmentByFilters,
} from '../models/equipmentModel.js'
import {
  addAvailability,
  getAvailabilityByEquipment,
  deleteAvailability,
} from '../models/availabilityModel.js'

export async function addEquipment(req, res) {
  try {
    const { name, type, pricePerHour, location } = req.body

    if (!name || !type || !pricePerHour) {
      return res.status(400).json({ message: 'Name, type, and price per hour are required' })
    }

    const id = await createEquipment({ ownerId: req.userId, name, type, pricePerHour, location })
    const equipment = await getEquipmentById(id)
    res.status(201).json({ equipment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error adding equipment' })
  }
}

export async function getMyEquipment(req, res) {
  try {
    const equipment = await getEquipmentByOwner(req.userId)
    res.json({ equipment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching equipment' })
  }
}

export async function editEquipment(req, res) {
  try {
    const { id } = req.params
    const existing = await getEquipmentById(id)

    if (!existing) {
      return res.status(404).json({ message: 'Equipment not found' })
    }
    if (existing.owner_id !== req.userId) {
      return res.status(403).json({ message: 'You do not own this equipment' })
    }

    const { name, type, pricePerHour, location, status } = req.body
    await updateEquipment(id, {
      name: name ?? existing.name,
      type: type ?? existing.type,
      pricePerHour: pricePerHour ?? existing.price_per_hour,
      location: location ?? existing.location,
      status: status ?? existing.status,
    })

    const updated = await getEquipmentById(id)
    res.json({ equipment: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error updating equipment' })
  }
}

export async function removeEquipment(req, res) {
  try {
    const { id } = req.params
    const existing = await getEquipmentById(id)

    if (!existing) {
      return res.status(404).json({ message: 'Equipment not found' })
    }
    if (existing.owner_id !== req.userId) {
      return res.status(403).json({ message: 'You do not own this equipment' })
    }

    await deleteEquipment(id)
    res.json({ message: 'Equipment deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error deleting equipment' })
  }
}

export async function searchEquipment(req, res) {
  try {
    const { type, location, maxPrice } = req.query
    const equipment = await searchEquipmentByFilters({ type, location, maxPrice })
    res.json({ equipment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error searching equipment' })
  }
}

export async function createAvailabilityHandler(req, res) {
  try {
    const { id } = req.params // equipment id
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' })
    }

    const equipment = await getEquipmentById(id)
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }
    if (equipment.owner_id !== req.userId) {
      return res.status(403).json({ message: 'You do not own this equipment' })
    }

    await addAvailability(id, startDate, endDate)
    const list = await getAvailabilityByEquipment(id)
    res.status(201).json({ availability: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error adding availability' })
  }
}

export async function listAvailabilityHandler(req, res) {
  try {
    const { id } = req.params
    const list = await getAvailabilityByEquipment(id)
    res.json({ availability: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching availability' })
  }
}

export async function removeAvailabilityHandler(req, res) {
  try {
    const { availId } = req.params
    await deleteAvailability(availId)
    res.json({ message: 'Availability removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error removing availability' })
  }
}
