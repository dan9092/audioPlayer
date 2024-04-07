import './App.css';
import React from 'react';
import AudioComponent from './components/player/PlayerComponent';
import { render } from 'react-dom';

const App = () => {
  return (
    
          <div className="App">
            <main className='app-main'>
              <AudioComponent />
            </main>
          </div>
        
  );
}

export default App;
