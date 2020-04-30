import React from 'react';
import { Link } from 'react-router-dom';
import './common.css'

const Button = (props) => (
    props.url
      ? <Link to={props.url} className={"btn btn-" + props.type}>{props.label}</Link>
      : <button onClick={props.onClick} className={"btn btn-" + props.type}>{props.label}</button>
)

export default Button;