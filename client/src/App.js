import './App.css'
import { Route } from 'react-router-dom'
import Homepage from './components/Homepage'  // renders page
import Game from './components/Game'          // renders game

// This App component acts as the main layout component for the 
// application, rendering different components based on the current 
// URL path using Route.
//
// = functional component that sets up the routes for the application
// renders two routes: homepage and game
// @param path .. refers to path in url
const App = () => {
  return (
    <div className="App">
      <Route path='/' exact component={Homepage} />
      <Route path='/play' exact component={Game} />
    </div>
  )
}

// export as the default export of the module
export default App
