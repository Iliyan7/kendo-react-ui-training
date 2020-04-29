import React from 'react'
import { Button } from '@progress/kendo-react-buttons'
import { Menu, MenuItem } from '@progress/kendo-react-layout';
import './Navigation.css'

export default () => {
  return (
    <React.Fragment>
      <Button icon="plus">Compose</Button>

      <div className="navmenu">
        <Menu vertical={true} style={{ display: 'block' }}>
          <MenuItem text="Inbox" />
          <MenuItem icon="star" text="Starred" />
          <MenuItem icon="clock" text="Snoozed" />
          <MenuItem icon="plane" text="Sent" />
          <MenuItem icon="file" text="Drafts" />
        </Menu>
      </div>
    </React.Fragment>
  )
}