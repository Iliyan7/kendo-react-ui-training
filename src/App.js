import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink } from "react-router-dom";
import { inject, observer } from 'mobx-react'
import Mailbox from './componenets/Mailbox';
import Calendar from './componenets/Calendar';
import Contacts from './componenets/Contacts';
import './App.css';
import '@progress/kendo-theme-material/dist/all.css';

const App = inject('store')(observer(
  class App extends Component {
    constructor(props) {
      super(props);
    }

    componentDidMount() {
      
    }

    render() {
      return (
        <Router>
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/mailbox"><Mailbox /></Route>
            <Route exact path="/calendar"><Calendar /></Route>
            <Route exact path="/contacts"><Contacts /></Route>
          </Switch>
        </Router>
      )
    }
  }
))

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
              ? <button onClick={this.handleAuthorize}>Authorize</button>
              : <button onClick={this.handleLogout}>Logout</button>
            }
          </div>
          <div className="box mailbox">
            <NavLink to="/mailbox">Mailbox</NavLink>
          </div>
          <div className="box calendar">
            <NavLink to="/calendar">Calendar</NavLink>
          </div>
          <div className="box contacts">
            <NavLink to="/contacts">Contacts</NavLink>
          </div>
        </div>
      )
    }
  }
))

export default App;
