import * as css from './../css'

export const eventPropGetter = (event, start, end, isSelected) => {
  let name = '',
    style = { fontSize: 13 }

  if (event.eventTime) {
    switch (event.eventTime.review) {
      case '1D':
        style = css.event1d

        break
      case '2H':
        style = css.event1h
        break
      case '30M':
        style = css.event30m
        break
      case '7D':
        style = css.event7d
        break
      case '30D':
        style = css.event30d
        break
    }
    if (!event.eventTime.tick) {
      style = { ...style, ...css.eventTicked }
    }
  }
  return {
    className: name,
    style,
  }
}
