import React from "react";
import ReactDOM from "react-dom";

import Chat from './Chat.js'
import "./index.css";

const App = () => <div><Chat /></div>;

ReactDOM.render(<App />, document.getElementById("app"));
