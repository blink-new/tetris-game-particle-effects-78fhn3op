
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TETROMINOS, TETROMINO_TYPES } from '../utils/tetrominos'
import { checkCollision, createStage } from '../utils/gameHelpers'

export type TetrominoType = keyof typeof TETROMINOS
export type CellType = [string, string]
export type Stage = CellType[][]

interface GameContextType {
  score: number
  rows: number
  level: number
  gameOver: boolean
  paused: boolean
  stage: Stage
  nextPiece: TetrominoType
  player: {
    pos: { x: number; y: number }
    tetromino: (string | number)[][]
    collided: boolean
    tetrominoType: TetrominoType
  }
  resetPlayer: () => void
  updatePlayerPos: (pos: { x: number; y: number; collided: boolean }) => void
  rotatePlayer: (dir: number) => void
  dropPlayer: () => void
  hardDrop: () => void
  togglePause: () => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

interface GameProviderProps {
  children: ReactNode
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [stage, setStage] = useState(createStage())
  const [nextPiece, setNextPiece] = useState<TetrominoType>(
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)]
  )
  const [dropTime, setDropTime] = useState<null | number>(null)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [rows, setRows] = useState(0)
  const [level, setLevel] = useState(1)
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS.I.shape,
    collided: false,
    tetrominoType: 'I' as TetrominoType,
  })

  // Score calculation
  const calculateScore = (rowsCleared: number) => {
    const linePoints = [40, 100, 300, 1200]
    if (rowsCleared > 0) {
      setScore((prev) => prev + linePoints[rowsCleared - 1] * level)
      setRows((prev) => prev + rowsCleared)
    }
  }

  // Level up
  useEffect(() => {
    if (rows >= level * 10) {
      setLevel((prev) => prev + 1)
    }
  }, [rows, level])

  // Drop time based on level
  useEffect(() => {
    if (!gameOver && !paused) {
      setDropTime(1000 / (level + 0.5))
    }
  }, [level, gameOver, paused])

  // Auto drop
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (dropTime && !gameOver && !paused) {
      timer = setInterval(() => {
        drop()
      }, dropTime)
    }
    return () => clearInterval(timer)
  }, [dropTime, gameOver, paused])

  const resetPlayer = () => {
    const currentNextPiece = nextPiece
    const newNextPiece = TETROMINO_TYPES[
      Math.floor(Math.random() * TETROMINO_TYPES.length)
    ] as TetrominoType
    
    setPlayer({
      pos: { x: stage[0].length / 2 - 2, y: 0 },
      tetromino: TETROMINOS[currentNextPiece].shape,
      collided: false,
      tetrominoType: currentNextPiece,
    })
    setNextPiece(newNextPiece)
    setGameOver(false)
  }

  const resetGame = () => {
    setStage(createStage())
    setScore(0)
    setRows(0)
    setLevel(1)
    setGameOver(false)
    setPaused(false)
    resetPlayer()
  }

  const updateStage = (prevStage: Stage): Stage => {
    // First flush the stage
    const newStage = prevStage.map((row) =>
      row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    )

    // Then draw the tetromino
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y][x + player.pos.x] = [
            player.tetrominoType,
            `${player.collided ? 'merged' : 'clear'}`,
          ]
        }
      })
    })

    // Then check if we collided
    if (player.collided) {
      resetPlayer()
      const sweepRows = (newStage: Stage): Stage => {
        let rowsCleared = 0
        const stage = newStage.reduce((acc, row) => {
          if (row.findIndex((cell) => cell[0] === 0) === -1) {
            rowsCleared += 1
            acc.unshift(new Array(newStage[0].length).fill([0, 'clear']) as CellType[])
            return acc
          }
          acc.push(row)
          return acc
        }, [] as Stage)
        
        calculateScore(rowsCleared)
        return stage
      }
      return sweepRows(newStage)
    }

    return newStage
  }

  useEffect(() => {
    if (!gameOver && !paused) {
      setStage((prev) => updateStage(prev))
    }
  }, [player])

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    if (!gameOver && !paused) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x + x, y: prev.pos.y + y },
        collided,
      }))
    }
  }

  const rotatePlayer = (dir: number) => {
    if (gameOver || paused) return

    const clonedPlayer = JSON.parse(JSON.stringify(player))
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir)

    const pos = clonedPlayer.pos.x
    let offset = 1
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir)
        clonedPlayer.pos.x = pos
        return
      }
    }

    setPlayer(clonedPlayer)
  }

  const rotate = (matrix: any[][], dir: number) => {
    // Make the rows become columns (transpose)
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    )
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetro.map((row) => row.reverse())
    return rotatedTetro.reverse()
  }

  const drop = () => {
    if (!gameOver && !paused) {
      // Increase level when player has cleared 10 rows
      if (rows >= (level + 1) * 10) {
        setLevel((prev) => prev + 1)
        // Also increase speed
        setDropTime(1000 / (level + 1) + 200)
      }

      if (!checkCollision(player, stage, { x: 0, y: 1 })) {
        updatePlayerPos({ x: 0, y: 1, collided: false })
      } else {
        // Game over
        if (player.pos.y < 1) {
          setGameOver(true)
          setDropTime(null)
        }
        updatePlayerPos({ x: 0, y: 0, collided: true })
      }
    }
  }

  const dropPlayer = () => {
    if (!gameOver && !paused) {
      drop()
    }
  }

  const hardDrop = () => {
    if (gameOver || paused) return
    
    let newY = player.pos.y
    while (!checkCollision(player, stage, { x: 0, y: newY - player.pos.y + 1 })) {
      newY += 1
    }
    
    updatePlayerPos({ x: 0, y: newY - player.pos.y, collided: true })
  }

  const togglePause = () => {
    if (!gameOver) {
      setPaused(!paused)
      if (paused) {
        setDropTime(1000 / (level + 0.5))
      } else {
        setDropTime(null)
      }
    }
  }

  return (
    <GameContext.Provider
      value={{
        score,
        rows,
        level,
        gameOver,
        paused,
        stage,
        nextPiece,
        player,
        resetPlayer,
        updatePlayerPos,
        rotatePlayer,
        dropPlayer,
        hardDrop,
        togglePause,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}