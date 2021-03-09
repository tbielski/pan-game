import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import MQTT from "async-mqtt";

import NewPlayer from "./pages/NewPlayer/NewPlayer";
import NewRoom from "./pages/NewRoom/NewRoom";
import Game from "./pages/Game/Game";
import Menu from "./pages/Menu/Menu";

function App() {
  const [client, setClient] = useState(null);
  useEffect(() => setClient(MQTT.connect("ws://10.45.3.64:8000/mqtt")), [
    setClient,
  ]);

  return (
    <AlertProvider template={AlertTemplate} position={positions.TOP_CENTER}>
      <div className="App">
        <Router>
          <Switch>
            <Route path="/room/:roomId/:mode" exact>
              <NewRoom client={client} />
            </Route>

            <Route path="/game/:roomId/:mode" exact>
              <Game client={client} />
            </Route>

            <Route path="/menu/:playerId" exact>
              <Menu />
            </Route>

            <Route path="/" exact>
              <NewPlayer />
            </Route>
          </Switch>
        </Router>
      </div>
    </AlertProvider>
  );
}

export default App;
