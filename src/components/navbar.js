import React, { Component } from 'react'
export const NavBar = ({ setState }) => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <button
      className="btn btn-outline-success my-2 my-sm-0"
      type="button"
      onClick={() =>
        setState({
          page: 0,
        })}
    >
      Calendar
    </button>
    <button
      className="btn btn-outline-success my-2 my-sm-0"
      type="button"
      onClick={() =>
        setState({
          page: 1,
        })}
    >
      Create
    </button>
  </nav>
)
