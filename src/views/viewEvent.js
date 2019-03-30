import React, { Component } from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import callApi from '../util/api'
import QRCode from 'qrcode.react'
import '../App.css'
import { Document, Page } from 'react-pdf'

const FromDate = ({ startDate, setState }) => (
  <div className="col">
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text">start</span>
      </div>
      <DatePicker
        selected={startDate}
        type="text"
        className="form-control"
        showTimeSelect
        dateFormat="LLL"
        timeIntervals={10}
        onChange={date =>
          setState({
            startDate: date,
          })}
        aria-label="Amount (to the nearest dollar)"
      />
      <div className="input-group-append">
        <span className="input-group-text">Date</span>
      </div>
    </div>
  </div>
)

const MyInput = ({ name, value, setState, type, edit = true }) => {
  let disabled = edit == false ? { disabled: 'disabled' } : {}

  return (
    <div className="col">
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon1">
            {name}
          </span>
        </div>
        <input
          type={type}
          value={value}
          {...disabled}
          onChange={event => {
            let obj = {}
            obj[name] = type == 'checkbox' ? !value : event.target.value

            setState(obj)
          }}
          defaultChecked={value}
          className="form-control"
          placeholder={name}
          aria-label={name}
          aria-describedby="basic-addon1"
        />
      </div>
    </div>
  )
}

class ViewEvent extends Component {
  state = {
    uploadUrl: '',
    ngrokUrl: 'localhost:8000',
    edit: false,

    _id: this.props._id,
    page: this.props.page,
    heading: this.props.heading,
    source: this.props.source,
    notes: this.props.notes,
    keyPoints: this.props.keyPoints,
    urls: this.props.urls,
    ebbinghaus: this.props.ebbinghaus,
    uploaded_images: this.props.uploaded_images,
    event: this.props.event,
    tick: this.props.event.tick,
  }
  componentDidMount() {
    let endPoint = `getUploadLink/`
    callApi(endPoint).then(res => {
      console.log('json :' + JSON.stringify(res))

      this.setState({
        uploadUrl: res.ngrokUrl + this.props._id,
        ngrokUrl: res.ngrokUrl.slice(
          0,
          res.ngrokUrl.search(':800') >= 0
            ? res.ngrokUrl.search(':800') + 6
            : res.ngrokUrl.search('.io') + 4
        ),
      })
    })
  }
  saveEventData() {
    console.log(`updateEvent`)
    const { _id, page, heading, source, notes, keyPoints, urls } = this.state
    let obj = {
      page,
      heading,
      source,
      notes,
      keyPoints,
      urls,
    }
    callApi(`updateEvent/${_id}`, 'post', obj).then(res =>
      console.log('json:' + JSON.stringify(res))
    )
  }
  render() {
    //  {
    //   _id: '5b4f9a9c61f86368a1e2610e',
    //   __v: 0,
    //   uploaded_images: [],
    //   ebbinghaus: true,
    //   urls: ['test url 1', 'test url 2'],
    //   keyPoints: 'Test  KeyPoints',
    //   notes: 'Test Notes',
    //   page: 'Test Page',
    //   source: 'Test Sourrce',
    //   heading: 'Test Heading',
    //   createdOn: '2018-07-18T19:53:00.617Z',
    // }
    const {
      _id,
      page,
      heading,
      source,
      notes,
      keyPoints,
      urls,
      ebbinghaus,
      uploaded_images,
      event,
      tick,
    } = this.state
    const { uploadUrl, ngrokUrl, edit } = this.state

    const eventTimeId = event.eventTime._id

    let disabled = edit == false ? { disabled: 'disabled' } : {}

    return (
      <div className="create-event-container event-form">
        <MyInput
          name="heading"
          setState={this.setState.bind(this)}
          value={heading}
          type="text"
          edit={edit}
        />
        <MyInput
          name="source"
          value={source}
          type="text"
          setState={this.setState.bind(this)}
          edit={edit}
        />
        <MyInput
          name="page"
          value={page}
          type="text"
          setState={this.setState.bind(this)}
          edit={edit}
        />
        <div className="col">
          <div className="input-group input-group-lg">
            <div className="input-group-prepend">
              <span className="input-group-text">Notes</span>
            </div>
            <textarea
              className="form-control"
              aria-label="With textarea"
              value={notes}
              {...disabled}
              onChange={event =>
                this.setState({
                  notes: event.target.value,
                })}
            />
          </div>
        </div>
        <br />
        <MyInput
          name="keyPoints"
          value={keyPoints}
          type="text"
          setState={this.setState.bind(this)}
          edit={edit}
        />
        <div className="col">
          {urls.map((url, index) => (
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text"> URL </span>
              </div>
              <input
                className="form-control"
                aria-label="With textarea"
                type="text"
                value={url}
                {...disabled}
                onChange={event => {
                  let { urls } = this.state
                  urls[index] = event.target.value
                  this.setState({
                    urls,
                  })
                }}
              />
            </div>
          ))}
        </div>
        <br />
        <MyInput
          name="ebbinghaus"
          value={ebbinghaus}
          type="checkbox"
          setState={this.setState.bind(this)}
          edit={edit}
        />
        <MyInput
          name="edit"
          value={edit}
          type="checkbox"
          setState={this.setState.bind(this)}
        />
        <div className="col">
          <input
            type="checkbox"
            value={tick}
            onChange={event => {
              console.log(event)
              const ticker = !tick
              console.log(`tickEvent/${_id}/${ticker}`)
              let obj = {}
              callApi(`tickEvent/${eventTimeId}/${ticker}`).then(res =>
                console.log('json:' + JSON.stringify(res))
              )
              obj['tick'] = ticker

              this.setState(obj)
            }}
            className="form-control"
            aria-describedby="basic-addon1"
          />
        </div>

        <QRCode value={uploadUrl} />

        {uploaded_images.map(image => (
          <div>
            <a
              style={{ display: 'table-cell' }}
              href={'http://localhost:8000/' + image}
              target="_blank"
            >
              {image.toLowerCase().search('.pdf') >= 0 ? (
                <Document file={'http://localhost:8000/' + image}>
                  <Page pageNumber={1} />
                </Document>
              ) : (
                <img width="100px" height="auto" src={'' + ngrokUrl + image} />
              )}
            </a>
            <br />
          </div>
        ))}
        <a style={{ display: 'table-cell' }} href={uploadUrl} target="_blank">
          upload image
        </a>
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              callApi(`deleteEvent/${eventTimeId}`).then(res =>
                console.log('json:' + JSON.stringify(res))
              )
            }}
          >
            Delete
          </button>
        </div>
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.saveEventData.bind(this)}
          >
            Save
          </button>
        </div>
      </div>
    )
  }
}
export default ViewEvent
