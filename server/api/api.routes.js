import { Router } from 'express'
import mongoose from 'mongoose'
import async from 'async'
import fs from 'fs'
import path from 'path'
const router = new Router()
import { eventsData, eventsTime } from '../models/events'
import { ngrokUrl, app } from './../server'
// Get all Posts
router.route('/getEvents/:start/:end').get((req, res) => {
  const { start, end } = req.params
  console.log(req.params)
  eventsTime
    .find({ fromTime: { $gte: new Date(start), $lt: new Date(end) } })
    .exec((err, result) => {
      if (err) {
        res.status(500).send(err)
      }
      res.json({ result })
    })
})
router.route('/createEvent').post((req, res) => {
  // eventsData.
  let {
    page,
    heading,
    source,
    notes,
    keyPoints,
    urls,
    ebbinghaus,
    startDate,
  } = req.body
  startDate = new Date(startDate)
  var event = new eventsData({
    _id: new mongoose.Types.ObjectId(),
    page,
    heading,
    source,
    notes,
    keyPoints,
    urls,
    ebbinghaus,
  })
  event.save(err => {
    if (err) {
      res.status(500).send(err)
      return
    }
    let obj = {
      heading,
      eventId: event._id,
    }

    let firstReviewDate = new Date(startDate.getTime())
    let firstReviewDateEnd = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 mins

    let first = new eventsTime({
      ...obj,
      _id: new mongoose.Types.ObjectId(),
      fromTime: firstReviewDate,
      toTime: firstReviewDateEnd,
      review: 'FIRST',
    })
    let asyncFunctionsObj = {}
    asyncFunctionsObj['first'] = function(callback) {
      first.save(callback)
    }

    if (ebbinghaus) {
      let secReviewDate = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 mins
      let secReviewDateEnd = new Date(secReviewDate.getTime() + 20 * 60 * 1000) // 20 mins
      let second = new eventsTime({
        ...obj,
        _id: new mongoose.Types.ObjectId(),
        fromTime: secReviewDate,
        toTime: secReviewDateEnd,
        review: '30M',
      })
      asyncFunctionsObj['second'] = function(callback) {
        second.save(callback)
      }

      let thirdReviewDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hour
      let thirdReviewDateEnd = new Date(
        thirdReviewDate.getTime() + 10 * 60 * 1000
      ) // 10 mins
      let third = new eventsTime({
        ...obj,
        _id: new mongoose.Types.ObjectId(),
        fromTime: thirdReviewDate,
        toTime: thirdReviewDateEnd,
        review: '2H',
      })
      asyncFunctionsObj['third'] = function(callback) {
        third.save(callback)
      }

      let fourthReviewDate = new Date(
        new Date(startDate).setDate(startDate.getDate() + 1)
      ) // 1 day
      let fourthReviewDateEnd = new Date(
        fourthReviewDate.getTime() + 10 * 60 * 1000
      ) //10 mins
      let fourth = new eventsTime({
        ...obj,
        _id: new mongoose.Types.ObjectId(),
        fromTime: fourthReviewDate,
        toTime: fourthReviewDateEnd,
        review: '1D',
      })
      asyncFunctionsObj['fourth'] = function(callback) {
        fourth.save(callback)
      }

      let fifthReviewDate = new Date(
        new Date(startDate).setDate(startDate.getDate() + 7)
      ) // 1 week
      let fifthReviewDateEnd = new Date(
        fifthReviewDate.getTime() + 15 * 60 * 1000
      ) // 15 mins
      let fifth = new eventsTime({
        ...obj,
        _id: new mongoose.Types.ObjectId(),
        fromTime: fifthReviewDate,
        toTime: fifthReviewDateEnd,
        review: '7D',
      })
      asyncFunctionsObj['fifth'] = function(callback) {
        fifth.save(callback)
      }

      let sixthReviewDate = new Date(
        new Date(startDate).setDate(startDate.getDate() + 30)
      ) // 1 month
      let sixthReviewDateEnd = new Date(
        sixthReviewDate.getTime() + 15 * 60 * 1000
      ) // 15 mins
      let sixth = new eventsTime({
        ...obj,
        _id: new mongoose.Types.ObjectId(),
        fromTime: sixthReviewDate,
        toTime: sixthReviewDateEnd,
        review: '30D',
      })
      asyncFunctionsObj['sixth'] = function(callback) {
        sixth.save(callback)
      }
    }
    async.parallel(asyncFunctionsObj, function(err, results) {
      // results is now equals to: {one: 1, two: 2}
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(results)
    })
  })
})
router.route('/setTick').get((req, res) => res.json(req.body))
router.route('/updateEvent/:id').post((req, res) => {
  const { id } = req.params
  console.log(req.params)

  eventsData.findOneAndUpdate({ _id: id }, req.body, { new: true }, function(
    err,
    doc
  ) {
    if (err) {
      res.status(500).send(err)
    }
    eventsTime.find({ eventId: id }, (errr, docs) => {
      if (err) {
        res.status(500).send(err)
      }
      let asyncFunctionsObj = []
      docs.map(doc => {
        asyncFunctionsObj.push(function(callback) {
          eventsTime.findOneAndUpdate(
            { _id: doc._id },
            { heading: req.body.heading },
            { new: true },
            callback
          )
        })
      })
      async.parallel(asyncFunctionsObj, function(err, results) {
        // results is now equals to: {one: 1, two: 2}
        if (err) {
          res.status(500).send(err)
          return
        }
        res.json(results)
      })
    })
  })
})
router.route('/uploadImagePage/:id').get((req, res) => {
  console.log(req.params)
  res.header('Content-Type', 'text/html').send(
    `<form method="post" enctype="multipart/form-data" action="/upload">
      <input type="file" name="file">
      <input type="hidden" name="id" value='${req.params.id}' >
      <input type="submit" value="Submit">
    </form>`
  )
})
router.route('/getUploadLink').get((req, res) => {
  res.json({ ngrokUrl: ngrokUrl + '/api/uploadImagePage/' })
})
router.route('/getEvent/:id').get((req, res) => {
  const { id } = req.params
  eventsData
    .findOne({
      _id: id,
    })
    .exec((err, result) => {
      if (err) {
        res.status(500).send(err)
      }
      res.json({ result })
    })
})
router.route('/tickEvent/:id/:value').get((req, res) => {
  const { id, value } = req.params
  console.log(req.params)

  eventsTime.findOneAndUpdate(
    { _id: id },
    { tick: value },
    { new: true },
    function(err, doc) {
      if (err) {
        res.status(500).send(err)
      }
      res.json({ doc })
    }
  )
})
router.route('/deleteEvent/:id').get((req, res) => {
  const { id } = req.params

  eventsTime.findByIdAndRemove({ _id: id }, (err, doc) => {
    if (err) {
      res.status(500).send(err)
    }
    res.json({ msg: ' successfully deleted' })
  })
})
const handleError = (err, res) => {
  res
    .status(500)
    .contentType('text/plain')
    .end(JSON.stringify(err))
}
//function uploadImage
// Get one post by cuid
export default router
