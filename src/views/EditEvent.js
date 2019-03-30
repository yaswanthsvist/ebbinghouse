import React, { Component } from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import callApi from './util/api'
import './App.css'

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

const MyInput = ({ name, value, type, setState }) => (
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
        onChange={event => {
          let obj = {}
          obj[name] = event.target.value
          setState(obj)
        }}
        className="form-control"
        placeholder={name}
        aria-label={name}
        aria-describedby="basic-addon1"
      />
    </div>
  </div>
)

class CreateEvent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      heading: '',
      source: '',
      page: '',
      notes: '',
      keyPoints: '',
      urls: ['dsdsdrerrr', 'dd'],
      ebbinghaus: true,
      startDate: moment(),
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleChange(event) {
    this.setState({
      heading: event.target.value,
    })
  }
  handleSubmit(event) {
    event.preventDefault()
    let obj = { ...this.state }
    obj.startDate = this.state.startDate.toDate()
    alert(JSON.stringify(obj))
    callApi('createEvent', 'post', obj).then(res =>
      console.log('json:' + JSON.stringify(res))
    )
  }

  render() {
    const {
      page,
      heading,
      source,
      notes,
      keyPoints,
      urls,
      ebbinghaus,
      startDate,
    } = this.state
    return (
      <div className="create-event-container event-form">
        <FromDate startDate={startDate} setState={this.setState.bind(this)} />
        <MyInput
          name="heading"
          setState={this.setState.bind(this)}
          value={heading}
          type="text"
        />
        <MyInput
          name="source"
          value={source}
          type="text"
          setState={this.setState.bind(this)}
        />
        <MyInput
          name="page"
          value={page}
          type="text"
          setState={this.setState.bind(this)}
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
        />
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    )
  }
}
export default CreateEvent
