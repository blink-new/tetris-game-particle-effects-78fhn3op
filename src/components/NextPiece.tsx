
import { TETROMINOS } from '../utils/tetrominos'
import { TetrominoType } from '../context/GameContext'

interface NextPieceProps {
  type: TetrominoType
}

const NextPiece = ({ type }: NextPieceProps) => {
  const tetromino = TETROMINOS[type]

  return (
    <div className="flex justify-center items-center bg-gray-800/70 p-2 rounded">
      <div className="grid grid-flow-row gap-0">
        {tetromino.shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`w-4 h-4 border border-gray-900/30 ${
                  cell !== 0 ? `tetris-cell tetris-cell-${type.toLowerCase()}` : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NextPiece