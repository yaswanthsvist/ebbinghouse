import React, {
  Component
} from 'react'
import Calendar from 'react-big-calendar'
import moment from 'moment'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import CreateEvent from './CreateEvent'
import ViewEvent from './views/viewEvent'
import callApi from './util/api'
import * as css from './css'
import {
  eventPropGetter
} from './util/utils'
import {
  NavBar
} from './components/navbar'
import './App.css'
import appStyles from './App.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import logo from './logo.svg'

Calendar.setLocalizer(Calendar.momentLocalizer(moment))

const DnDCalendar = withDragAndDrop(Calendar)

class HomeScreen extends Component {
  state = {
    page: 0,
    selectedEvent: {},
    events: [{
      start: new Date(),
      end: new Date(moment().add(1, 'days')),
      title: 'Some title',
    }, ],
  }
  componentDidMount() {
    let endPoint = `getEvents/${new Date(
      moment()
        .startOf('year')
        .toDate()
    )}/${new Date(
      moment()
        .endOf('year')
        .toDate()
    )}`
    callApi(endPoint).then(res => {
      console.log('json :' + JSON.stringify(res))
      let events = []
      res.result &&
        res.result.map(eventTime =>
          events.push({
            start: new Date(eventTime.fromTime),
            end: new Date(eventTime.toTime),
            title: `${eventTime.review}|${moment(eventTime.fromTime).format(
              'h:m:a'
            )} ${eventTime.heading}`,
            eventTime,
            className: 'event-1d',
          })
        )
      this.setState({
        events
      })
    })
  }

  onSelectEvent = event => {
    let endPoint = `getEvent/${event.eventTime.eventId}`
    callApi(endPoint).then(res => {
      console.log('getEvent json :' + JSON.stringify(res))
      this.setState({
        selectedEvent: {
          ...res.result,
          event,
        },
        page: 2,
      })
    })
  }
  onEventResize = (type, {
    event,
    start,
    end,
    allDay
  }) => {
    this.setState(state => {
      state.events[0].start = start
      state.events[0].end = end
      return {
        events: state.events
      }
    })
  }

  onEventDrop = ({
    event,
    start,
    end,
    allDay
  }) => {
    console.log(start)
  }

  render() {
    const {
      events,
      page
    } = this.state
    return ( <
      div className = "container" >
      <
      NavBar setState = {
        this.setState.bind(this)
      }
      /> {
        page == 0 ? ( <
          div className = "App" >
          <
          DnDCalendar defaultDate = {
            new Date()
          }
          defaultView = "month"
          events = {
            events
          }
          onEventDrop = {
            this.onEventDrop
          }
          onEventResize = {
            this.onEventResize
          }
          onRangeChange = {
            event => console.log(event)
          }
          onSelectEvent = {
            this.onSelectEvent
          }
          resizable eventPropGetter = {
            eventPropGetter
          }
          step = {
            10
          }
          style = {
            {
              height: '100vh'
            }
          }
          /> <
          /div>
        ) : null
      } {
        page == 1 ? < CreateEvent / > : null
      } {
        page == 2 ? < ViewEvent { ...this.state.selectedEvent
        }
        /> : null} <
        /div>
      )
    }
  }
  export default HomeScreen
