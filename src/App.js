import React from "react";
import './App.css';
import Nav from './component/Nav';
import BasicView from "./component/BasicView/BasicView.";
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
      <Router>
        <div className="App">
            <Nav />
            <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/basicView" component={BasicView} />
            </Switch>
        </div>
      </Router>
  );
}

const Home = () => {
    return(
        <div>
            <h1>Zoran Krstovski</h1>
            <div>Upload files from computer and send them to OCR API for converting them to plain text</div>
        </div>
        )
};

export default App;
