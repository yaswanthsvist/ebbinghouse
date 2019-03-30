import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { FormattedMessage } from 'react-intl'
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
require('./../../../../css/react-big-calendar.css')

BigCalendar.momentLocalizer(moment) // or globalizeLocalizer

const MyCalendar = props => (
  <div>
    <BigCalendar
      events={[
        {
          start: new Date(),
          end: new Date(moment().add(1, 'days')),
          title: 'Some title',
        },
      ]}
      startAccessor="startDate"
      endAccessor="endDate"
    />
  </div>
)

export function PostDetailPage(props) {
  return (
    <div style={{ height: 1000, width: 1000 }}>
      <MyCalendar />
    </div>
  )
}

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {}
}

PostDetailPage.propTypes = {
  post: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    cuid: PropTypes.string.isRequired,
  }).isRequired,
}

export default connect(mapStateToProps)(PostDetailPage)
