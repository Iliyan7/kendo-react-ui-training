import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'
import { process } from '@progress/kendo-data-query';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Window } from '@progress/kendo-react-dialogs';
import Unaothorized from '../Shared/Unaothorized';

const Mailbox = inject('store')(observer(
  class Mailbox extends Component {
    constructor(props) {
      super(props);

      this.state = {
        dataState: {
          sort: [
            { field: "date", dir: "desc", }
          ],
          skip: 0,
          take: 10
        },
        windowVisible: false,
        gridClickedRow: {}
      }
    }

    handleGridDataStateChange = (e) => {
      console.log(e)
      this.setState({ dataState: e.data });
    }

    handleGridRowClick = (e) => {
      this.setState({
        windowVisible: true,
        gridClickedRow: e.dataItem
      });
    }

    closeWindow = (e) => {
      this.setState({
        windowVisible: false
      });
    }

    render() {
      return this.props.store.isAuthrozied
        ? (<div>
          Mailbox

          <Grid
            data={process(this.props.store.mailbox, this.state.dataState)}
            pageable={true}
            sortable={true}
            {...this.state.dataState}
            onDataStateChange={this.handleGridDataStateChange}
            onRowClick={this.handleGridRowClick}
          >
            <GridColumn field="sender" title="Sender" />
            <GridColumn field="subject" title="Subject" />
            <GridColumn field="date" title="Date" />
          </Grid>

          {this.state.windowVisible &&
            <Window
              title="Mail Details"
              onClose={this.closeWindow}
              initialHeight={480}
              initialWidth={640}
            >
              <dl>
                <dt>Sender</dt>
                <dd>{this.state.gridClickedRow.sender}</dd>
                <dt>Subject</dt>
                <dd>{this.state.gridClickedRow.subject}</dd>
                <dt>Date</dt>
                <dd>{this.state.gridClickedRow.date}</dd>
                <dt>Content</dt>
                <dd>{this.state.gridClickedRow.content}</dd>
              </dl>
            </Window>
          }

        </div>
      )
      : <Unaothorized />
    }
  })
)

export default Mailbox;
