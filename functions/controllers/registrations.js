const Student = require('../models/student')

exports.registerEvent = async (req, res, next) => {
  const eventId = req.params.eventId
  const studentId = req.studentId

  if (!studentId) {
    const error = new Error('Unauthorized')
    error.statusCode = 403
    return next(error)
  }

  try {
    const event = await Event.findById(eventId)
    if (!event) {
      const error = new Error('Could not find event.')
      error.statusCode = 404
      return next(error)
    }

    if (event.isRegistrationOpen) {
      if (event.registrations.indexOf(studentId) !== -1) {
        event.registrations.push(studentId)
        try {
          const student = await Student.findById(studentId)

          if (!student) {
            const error = new Error('Could not find student')
            error.statusCode = 404
            throw error
          }

          student.creds.push({
            points: event.registrationPoints,
            title: `Registered for Event - ${event.title}`,
            description: `Received ${event.registrationPoints} Points for registering in the event - ${event.title}`,
            timestamp: Date.now(),
            key: event._id,
          })

          student.totalCreds += event.registrationPoints

          const result = await student.save()
          res
            .status(200)
            .json({ message: 'Student updated!', studentId: result._id })
        } catch (err) {
          if (!err.statusCode) {
            err.statusCode = 500
          }
          next(err)
        }
      }
    }

    const result = await event.save()
    res.status(201).json({ message: 'Event updated!', event: result })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.isRegistered = async (req, res, next) => {
  const eventId = req.params.eventId
  const studentId = req.studentId

  if (!studentId) {
    const error = new Error('Unauthorized')
    error.statusCode = 403
    return next(error)
  }

  try {
    const event = await Event.findById(eventId)
    if (!event) {
      const error = new Error('Could not find event.')
      error.statusCode = 404
      return next(error)
    }

    let isRegistered = false
    if (event.registrations.indexOf(studentId) !== -1) {
      isRegistered = true
    }

    await event.save()
    res.status(201).json({ message: 'Status Fetched', isRegistered })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.registrations = async (req, res, next) => {
  const eventId = req.params.eventId

  try {
    const event = await Event.findById(eventId)
    if (!event) {
      const error = new Error('Could not find event.')
      error.statusCode = 404
      return next(error)
    }
    res.status(201).json({
      message: 'Registrations Fetched',
      registrations: event.registrations,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
