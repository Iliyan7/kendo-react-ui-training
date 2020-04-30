import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'
import { ListView, ListViewHeader } from '@progress/kendo-react-listview';
import { Avatar } from '@progress/kendo-react-layout';
import { Pager } from '@progress/kendo-react-data-tools';
import Button from '../common/Button'
import Forbidden from '../common/Forbidden';
import './Contacts.css'

const MyHeader = () => {
  return (
    <ListViewHeader style={{ color: 'rgb(160, 160, 160)', fontSize: 18 }} className='pl-3 pb-2 pt-2'>
      CONTACTS
    </ListViewHeader>
  );
}

const MyItemRender = props => {
  let item = props.dataItem;

  return (
    <div className='row p-2 border-bottom align-middle' style={{ margin: 0 }}>
      <div className='col-2'>
        <Avatar shape='circle' type='image'>
          <img src={`${item.image}`} alt="avatar" />
        </Avatar>
      </div>
      <div className='col-6'>
        <h2 style={{ fontSize: 14, color: '#454545', marginBottom: 0 }}>{item.name}</h2>
        <div style={{ fontSize: 12, color: "#a0a0a0" }}>{item.email}</div>
      </div>
      <div className='col-4'>
        <div className='k-chip k-chip-filled'>
          <div className='k-chip-content'>
            {item.phoneNumber}
          </div>
        </div>
      </div>
    </div>
  );

}

const Contacts = inject('store')(observer(
  class Contacts extends Component {
    constructor(props) {
      super(props);

      this.state = {
        skip: 0,
        take: 10
      }
    }

    componentDidMount() {
    }

    handlePageChange = (e) => {
      this.setState({
        skip: e.skip,
        take: e.take
      });
    }

    render() {
      const { skip, take } = this.state;

      if (this.props.store.isAuthorized) {
        return (
          <div>
            <div className="button-container">
              <Button label="BACK" type="default" url="/" />
            </div>

            <div className="contacts-list">
              <ListView
                data={this.props.store.contacts.slice(skip, skip + take)}
                item={MyItemRender}
                style={{ width: "100%" }}
                header={MyHeader}
              />
              <Pager skip={skip} take={take} onPageChange={this.handlePageChange} total={this.props.store.contacts.length} />
            </div>
          </div>
        );

      } else {
        return <Forbidden />
      }
    }
  })
)

export default Contacts;
