import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink } from "react-router-dom";
import { inject, observer } from 'mobx-react'
import Mailbox from './componenets/Mailbox';
import Calendar from './componenets/Calendar';
import Contacts from './componenets/Contacts';
import Button from './componenets/common/Button';
import './App.css';

const App = inject('store')(observer(() => (
  <Router>
    <Switch>
      <Route exact path="/"><Home /></Route>
      <Route exact path="/mailbox"><Mailbox /></Route>
      <Route exact path="/calendar"><Calendar /></Route>
      <Route exact path="/contacts"><Contacts /></Route>
    </Switch>
  </Router>
)))

const Home = inject('store')(observer(
  class Home extends Component {

    constructor(props) {
      super(props);

      this.handleAuthorize = this.handleAuthorize.bind(this);
      this.handleLogout = this.handleLogout.bind(this);
    }

    handleAuthorize(e) {
      e.preventDefault();
      this.props.store.handleAuthClick();
    }

    handleLogout(e) {
      e.preventDefault();
      this.props.store.handleAuthClick();
    }

    render() {
      const isAuthorized = this.props.store.isAuthorized
      return (
        <div className="wrapper">
          <div className="box header">
            {!isAuthorized
              ? <Button label="AUTHROIZE" type="default" onClick={this.handleAuthorize} />
              : <Button label="LOGOUT" type="fancy" onClick={this.handleLogout} />
            }
          </div>
          <div className="box mailbox">
            <NavLink to="/mailbox" className="nav-link">
              <img src="http://icons.iconarchive.com/icons/dtafalonso/android-lollipop/96/Gmail-icon.png" alt="mailbox-icon"></img>
              <span>Mailbox</span>
            </NavLink>
          </div>
          <div className="box calendar">
            <NavLink to="/calendar" className="nav-link">
              <img src="http://icons.iconarchive.com/icons/marcus-roberto/google-play/96/Google-Calendar-icon.png" alt="calenar-icon"></img>
              <span>Calendar</span>
            </NavLink>
          </div>
          <div className="box contacts">
            <NavLink to="/contacts" className="nav-link">
              <img src="http://icons.iconarchive.com/icons/graphicloads/100-flat/96/contact-icon.png" alt="contacts-icon"></img>
              <span>Contacts</span>
            </NavLink>
          </div>
        </div>
      )
    }
  }
))

export default App;
