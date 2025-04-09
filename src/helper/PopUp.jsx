import { Alert, Slide } from '@mui/material';
import React from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const PopUp = (props) => {
  return (
    <Slide direction="left" in={props.state} mountOnEnter unmountOnExit>
      <div className="fixed top-24 right-4 z-50">
        <Alert variant="filled" severity={props.type}>
          {props.message}
        </Alert>
      </div>
    </Slide>
  )
}

export default PopUp