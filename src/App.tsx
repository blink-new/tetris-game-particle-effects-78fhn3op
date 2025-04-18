
import { useState, useEffect } from 'react'
import TetrisGame from './components/TetrisGame'
import { Button } from './components/ui/button'
import { GameProvider } from './context/GameContext'
import ParticleBackground from './components/ParticleBackground'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-4xl px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Tetris
        </h1>
        
        {!gameStarted ? (
          <div className="flex flex-col items-center space-y-6 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
              <Button 
                onClick={() => setGameStarted(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Game
              </Button>
              <Button 
                onClick={() => setShowInstructions(!showInstructions)}
                variant="outline"
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300"
              >
                {showInstructions ? 'Hide Instructions' : 'How to Play'}
              </Button>
            </div>
            
            {showInstructions && (
              <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl max-w-md w-full border border-purple-500/30 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-purple-300">How to Play</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded mr-2 text-xs">←→</span>
                    <span>Move piece left/right</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded mr-2 text-xs">↓</span>
                    <span>Move piece down</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded mr-2 text-xs">↑</span>
                    <span>Rotate piece</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded mr-2 text-xs">SPACE</span>
                    <span>Hard drop</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded mr-2 text-xs">P</span>
                    <span>Pause game</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <GameProvider>
            <TetrisGame onExit={() => setGameStarted(false)} />
          </GameProvider>
        )}
        
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Created with React, Vite, and tsParticles</p>
        </div>
      </div>
    </div>
  )
}

export default App