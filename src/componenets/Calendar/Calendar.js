import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView
} from '@progress/kendo-react-scheduler';
import Button from '../Shared/Button'
import Unaothorized from '../Shared/Unaothorized';
import './Calendar.css'

const Calendar = inject('store')(observer(
  class Calendar extends Component {
    constructor(props) {
      super(props);

      this.state = {
      }
    }

    componentDidMount() {

    }

    render() {
      const displayData = new Date();
      console.log(displayData);
      
      if (this.props.store.isAuthorized) {
        return (
          <div>
            <div className="button-container">
              <Button label="BACK" type="default" url="/" />
            </div>
            <div className="calendar-view">
              <Scheduler data={this.props.store.calendar} defaultDate={displayData}>
                <DayView />
                <WeekView />
                <MonthView />
              </Scheduler>
            </div>

          </div>
        );
      } else {
        return <Unaothorized />
      }
    }
  })
)

export default Calendar;
