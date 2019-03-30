import mongoose from 'mongoose'
const Schema = mongoose.Schema

const eventsTimeSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  review: { type: 'String', default: 'First', required: true },
  heading: { type: 'String', default: '', required: true },
  specialNotes: { type: 'String', required: false, default: '' },
  tick: { type: 'boolean', required: false, default: false },
  fromTime: { type: 'Date', required: true },
  toTime: { type: 'Date', required: true },
})
const eventsDataSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdOn: { type: 'Date', default: Date.now, required: true },
  heading: { type: 'String', default: '', required: true },
  source: { type: 'String', required: false, default: '' },
  page: { type: 'String', required: false, default: '' },
  notes: { type: 'String', required: false, default: '' },
  keyPoints: { type: 'String', required: false, default: '' },
  urls: { type: ['String'], required: false },
  ebbinghaus: { type: 'boolean', required: false, default: false },
  uploaded_images: { type: ['String'], required: false },
})

export const eventsData = mongoose.model('eventsData', eventsDataSchema)
export const eventsTime = mongoose.model('eventsTime', eventsTimeSchema)
