import { useWindowDimensions } from "role-player/src/helpers/window";
import "./App.css";

import {
  FirebaseDatastore,
  GameEngine,
  RolePlayerGame,
  Title,
} from "role-player/src";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { avalonRules } from "./avalonRules";

function App() {
  const gameRules = avalonRules;
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  const datastore = new FirebaseDatastore(firebaseConfig);

  const avalonEngine = new GameEngine(gameRules, datastore);

  // return (
  //   <div>
  //     <RolePlayerApp gameEngine={avalonEngine} />
  //   </div>
  // );
  const { height, width } = useWindowDimensions();
  return (
    <div className="RolePlayerApp">
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<Title />} />
            <Route
              path="/game/*"
              element={
                <RolePlayerGame
                  height={height}
                  width={width}
                  gameEngine={avalonEngine}
                />
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
