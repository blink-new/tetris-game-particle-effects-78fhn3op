
import { useEffect, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { Button } from './ui/button'
import { getGhostPosition } from '../utils/gameHelpers'
import { TETROMINOS } from '../utils/tetrominos'
import { createParticleExplosion } from '../utils/particleEffects'
import NextPiece from './NextPiece'
import { Pause, Play, RotateCcw, X } from 'lucide-react'

interface TetrisGameProps {
  onExit: () => void
}

const TetrisGame = ({ onExit }: TetrisGameProps) => {
  const {
    stage,
    player,
    updatePlayerPos,
    rotatePlayer,
    dropPlayer,
    hardDrop,
    resetGame,
    gameOver,
    score,
    rows,
    level,
    paused,
    togglePause,
    nextPiece,
  } = useGame()

  const ghostY = getGhostPosition(player, stage)

  const movePlayer = useCallback(
    (dir: number) => {
      if (!checkCollision(player, stage, { x: dir, y: 0 })) {
        updatePlayerPos({ x: dir, y: 0, collided: false })
      }
    },
    [player, stage, updatePlayerPos]
  )

  const keyUp = useCallback(
    ({ keyCode }: { keyCode: number }) => {
      if (!gameOver) {
        // Change the droptime speed when user releases down arrow
        if (keyCode === 40) {
          dropPlayer()
        }
      }
    },
    [gameOver, dropPlayer]
  )

  const move = useCallback(
    ({ keyCode, repeat }: { keyCode: number; repeat: boolean }) => {
      if (!gameOver && !paused) {
        if (keyCode === 37) {
          movePlayer(-1)
        } else if (keyCode === 39) {
          movePlayer(1)
        } else if (keyCode === 40) {
          if (repeat) return
          dropPlayer()
        } else if (keyCode === 38) {
          rotatePlayer(1)
        } else if (keyCode === 32) {
          hardDrop()
        }
      }

      if (keyCode === 80) {
        // P key for pause
        togglePause()
      }
    },
    [gameOver, paused, movePlayer, dropPlayer, rotatePlayer, hardDrop, togglePause]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      move({ keyCode: e.keyCode, repeat: e.repeat })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keyUp({ keyCode: e.keyCode })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [move, keyUp])

  useEffect(() => {
    resetGame()
  }, [])

  // Function to check if a cell is part of the ghost piece
  const isGhostCell = (x: number, y: number) => {
    if (ghostY === player.pos.y) return false
    
    for (let tetY = 0; tetY < player.tetromino.length; tetY++) {
      for (let tetX = 0; tetX < player.tetromino[tetY].length; tetX++) {
        if (
          player.tetromino[tetY][tetX] !== 0 &&
          player.pos.x + tetX === x &&
          ghostY + tetY === y
        ) {
          return true
        }
      }
    }
    return false
  }

  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    if (gameOver || paused) return
    
    // Create particle explosion at the clicked cell
    const cellElement = document.getElementById(`cell-${rowIndex}-${cellIndex}`)
    if (cellElement && stage[rowIndex][cellIndex][0] !== 0) {
      const rect = cellElement.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const color = stage[rowIndex][cellIndex][0] as string
      const rgbColor = TETROMINOS[color as keyof typeof TETROMINOS]?.color || '255, 255, 255'
      
      createParticleExplosion(x, y, rgbColor)
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
      <div className="relative">
        <div className="tetris-board p-1 rounded-md">
          {stage.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, cellIndex) => {
                const isGhost = isGhostCell(cellIndex, rowIndex)
                const cellType = cell[0] as string
                const cellClass = `tetris-cell tetris-cell-${cellType.toLowerCase()} ${
                  isGhost ? 'tetris-cell-ghost' : ''
                }`
                
                return (
                  <div
                    id={`cell-${rowIndex}-${cellIndex}`}
                    key={cellIndex}
                    className={`w-6 h-6 border border-gray-900/30 ${
                      cell[0] !== 0 || isGhost ? cellClass : 'bg-gray-900/50'
                    }`}
                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center game-over-overlay">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
            <p className="text-xl mb-6">Score: {score}</p>
            <div className="flex gap-3">
              <Button
                onClick={resetGame}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
              <Button
                onClick={onExit}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <X className="mr-2 h-4 w-4" />
                Exit
              </Button>
            </div>
          </div>
        )}

        {paused && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-2xl font-bold text-purple-400">PAUSED</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full md:w-auto">
        <div className="next-piece-container p-4 rounded-md">
          <h2 className="text-lg font-semibold text-purple-300 mb-2">Next Piece</h2>
          <NextPiece type={nextPiece} />
        </div>

        <div className="controls-container p-4 rounded-md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">Stats</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/70 p-2 rounded">
                <p className="text-sm text-gray-400">Score</p>
                <p className="text-xl font-bold text-white">{score}</p>
              </div>
              <div className="bg-gray-800/70 p-2 rounded">
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-xl font-bold text-white">{level}</p>
              </div>
              <div className="bg-gray-800/70 p-2 rounded">
                <p className="text-sm text-gray-400">Lines</p>
                <p className="text-xl font-bold text-white">{rows}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={togglePause}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {paused ? (
                <>
                  <Play className="mr-2 h-4 w-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              )}
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Restart
            </Button>
            <Button
              onClick={onExit}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800 w-full"
            >
              <X className="mr-2 h-4 w-4" /> Exit
            </Button>
          </div>
        </div>

        <div className="controls-container p-4 rounded-md hidden md:block">
          <h2 className="text-lg font-semibold text-purple-300 mb-2">Controls</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className="bg-purple-600/50 text-white px-2 py-1 rounded mr-2 text-xs">←→</span>
              <span className="text-gray-300">Move</span>
            </div>
            <div className="flex items-center">
              <span className="bg-purple-600/50 text-white px-2 py-1 rounded mr-2 text-xs">↑</span>
              <span className="text-gray-300">Rotate</span>
            </div>
            <div className="flex items-center">
              <span className="bg-purple-600/50 text-white px-2 py-1 rounded mr-2 text-xs">↓</span>
              <span className="text-gray-300">Down</span>
            </div>
            <div className="flex items-center">
              <span className="bg-purple-600/50 text-white px-2 py-1 rounded mr-2 text-xs">SPACE</span>
              <span className="text-gray-300">Drop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to check collision
const checkCollision = (
  player: any,
  stage: any,
  { x: moveX, y: moveY }: { x: number; y: number }
) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Check that our move is inside the game areas height (y)
          !stage[y + player.pos.y + moveY] ||
          // 3. Check that our move is inside the game areas width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Check that the cell we're moving to isn't set to clear
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true
        }
      }
    }
  }
  return false
}

export default TetrisGame