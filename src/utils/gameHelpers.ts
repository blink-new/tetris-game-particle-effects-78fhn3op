
import { Stage, CellType } from '../context/GameContext'

export const STAGE_WIDTH = 10
export const STAGE_HEIGHT = 20

export const createStage = (): Stage =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear']) as CellType[]
  )

export const checkCollision = (
  player: {
    pos: { x: number; y: number }
    tetromino: any[][]
    collided: boolean
  },
  stage: Stage,
  { x: moveX, y: moveY }: { x: number; y: number }
) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Check that our move is inside the game areas height (y)
          // We shouldn't go through the bottom of the play area
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

export const getGhostPosition = (
  player: {
    pos: { x: number; y: number }
    tetromino: any[][]
    collided: boolean
  },
  stage: Stage
) => {
  let ghostY = player.pos.y
  
  while (!checkCollision(
    { ...player, pos: { x: player.pos.x, y: ghostY + 1 } },
    stage,
    { x: 0, y: 0 }
  )) {
    ghostY += 1
  }
  
  return ghostY
}