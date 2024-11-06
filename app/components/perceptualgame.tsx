'use client'
import React, { useState, useEffect } from 'react'

interface Circle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  isTarget: boolean
  clicked: boolean
}

interface LevelConfig {
  circles: number
  baseSpeed: number
}

const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { circles: 4, baseSpeed: 0.8 },
  2: { circles: 5, baseSpeed: 0.85 },
  3: { circles: 5, baseSpeed: 0.9 },
  4: { circles: 6, baseSpeed: 0.95 },
  5: { circles: 6, baseSpeed: 1.0 },
  6: { circles: 7, baseSpeed: 1.1 },
  7: { circles: 7, baseSpeed: 1.2 },
  8: { circles: 8, baseSpeed: 1.3 },
  9: { circles: 8, baseSpeed: 1.4 },
  10: { circles: 9, baseSpeed: 1.5 }
} as const

export default function PerceptualGame() {
  const [showTarget, setShowTarget] = useState(false)
  const [hasSeenTarget, setHasSeenTarget] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [circles, setCircles] = useState<Circle[]>([])
  const [levelScore, setLevelScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [timeExpired, setTimeExpired] = useState(false)
  const [targetFound, setTargetFound] = useState(false)
  const [level, setLevel] = useState(1)
  const [gameCompleted, setGameCompleted] = useState(false)
  const maxPossibleScore = 5500

  const initializeLevel = (currentLevel: number): Circle[] => {
    const config = LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG]
    const circles: Circle[] = []
    const targetIndex = Math.floor(Math.random() * config.circles)
    
    for (let i = 0; i < config.circles; i++) {
      const angle = (i * Math.PI * 2) / config.circles
      const radius = 35
      const x = 50 + Math.cos(angle) * radius
      const y = 50 + Math.sin(angle) * radius
      
      const moveAngle = Math.random() * Math.PI * 2
      const speedVariation = 0.8 + Math.random() * 0.4
      const dx = Math.cos(moveAngle) * config.baseSpeed * speedVariation
      const dy = Math.sin(moveAngle) * config.baseSpeed * speedVariation

      circles.push({
        id: i,
        x,
        y,
        dx,
        dy,
        isTarget: i === targetIndex,
        clicked: false
      })
    }
    return circles
  }

  useEffect(() => {
    setCircles(initializeLevel(level))
  }, [level])

  useEffect(() => {
    let animationId: number | undefined
    let lastTime = performance.now()
    
    const updatePositions = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67
      lastTime = currentTime

      if (isPlaying && !timeExpired) {
        setCircles(currentCircles => 
          currentCircles.map(circle => {
            if (circle.clicked) return circle
            
            let newX = circle.x + circle.dx * deltaTime
            let newY = circle.y + circle.dy * deltaTime
            let newDx = circle.dx
            let newDy = circle.dy

            if (level >= 5) {
              const time = currentTime / 1000
              newX += Math.sin(time) * 0.2
              newY += Math.cos(time) * 0.2
            }

            if (level >= 8 && Math.random() < 0.02) {
              const angle = Math.random() * Math.PI * 2
              const speed = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG].baseSpeed
              newDx = Math.cos(angle) * speed
              newDy = Math.sin(angle) * speed
            }

            if (newX <= 5 || newX >= 95) newDx = -newDx
            if (newY <= 5 || newY >= 95) newDy = -newDy

            return {
              ...circle,
              x: Math.max(5, Math.min(95, newX)),
              y: Math.max(5, Math.min(95, newY)),
              dx: newDx,
              dy: newDy
            }
          })
        )
      }
      animationId = requestAnimationFrame(updatePositions)
    }

    if (isPlaying && !timeExpired) {
      animationId = requestAnimationFrame(updatePositions)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying, timeExpired, level])

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined
    if (isPlaying) {
      timerId = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsPlaying(false)
            setTimeExpired(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [isPlaying])

  const handleShowTarget = (show: boolean) => {
    setShowTarget(show)
    if (show) {
      setHasSeenTarget(true)
    }
  }

  const handleCircleClick = (circleId: number) => {
    if (!timeExpired || targetFound) return

    setClicks(prev => prev + 1)
    
    setCircles(currentCircles =>
      currentCircles.map(circle => {
        if (circle.id === circleId) {
          const isCorrect = circle.isTarget
          
          if (isCorrect) {
            setTargetFound(true)
            const points = 100 * level
            setLevelScore(prev => prev + points)
            setTotalScore(prev => prev + points + levelScore)
            
            if (level === 10) {
              setGameCompleted(true)
            }
          } else {
            setLevelScore(prev => prev - (25 * level))
          }
          
          return {
            ...circle,
            clicked: true
          }
        }
        return circle
      })
    )
  }

  const handleStart = () => {
    if (!hasSeenTarget) return
    setIsPlaying(true)
    setShowTarget(false)
    setTimeLeft(15)
    setTimeExpired(false)
    setTargetFound(false)
    setClicks(0)
    setLevelScore(0)
    setCircles(prev => prev.map(circle => ({ ...circle, clicked: false })))
  }

  const handleNextLevel = () => {
    if (level < 10 && targetFound) {
      setLevel(prev => prev + 1)
      setTimeLeft(15)
      setTimeExpired(false)
      setTargetFound(false)
      setClicks(0)
      setLevelScore(0)
      setShowTarget(false)
      setHasSeenTarget(false)
    }
  }

  const handleReset = () => {
    setLevel(1)
    setTotalScore(0)
    setLevelScore(0)
    setTimeLeft(15)
    setTimeExpired(false)
    setTargetFound(false)
    setClicks(0)
    setIsPlaying(false)
    setGameCompleted(false)
    setShowTarget(false)
    setHasSeenTarget(false)
    setCircles(initializeLevel(1))
  }

  if (gameCompleted) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-6">🎉 Congratulations! 🎉</h1>
        <p className="text-xl mb-4">You've mastered all levels!</p>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold">Total Score</p>
            <p className="text-3xl font-bold text-blue-600">{totalScore}</p>
            <p className="text-sm text-gray-600">out of {maxPossibleScore} possible points</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold">Performance</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((totalScore / maxPossibleScore) * 100)}%
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Level {level}/10</span>
          <span className="text-sm text-gray-500">
            {LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG].circles} circles
          </span>
        </div>
        <span className="text-lg text-yellow-600 font-bold">
          {totalScore} Total
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-500 rounded-full h-2 transition-all duration-300"
          style={{ width: `${(level / 10) * 100}%` }}
        />
      </div>

      <div className="flex justify-between mb-4">
        <span className="text-lg">Time: {timeLeft}s</span>
        <span className="text-lg">Level Points: {levelScore}</span>
      </div>

      <div className="relative aspect-square w-full bg-gray-100 rounded-lg border-2 border-gray-200">
        {circles.map(circle => (
          <div
            key={circle.id}
            onClick={() => handleCircleClick(circle.id)}
            className={`absolute w-8 h-8 rounded-full transition-colors duration-200 
              ${circle.clicked ? 
                  (circle.isTarget ? 'bg-green-500' : 'bg-red-500') :
                  (circle.isTarget && showTarget ? 'bg-yellow-400' : 'bg-blue-500')
              } 
              ${timeExpired && !targetFound ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onPointerDown={() => !isPlaying && handleShowTarget(true)}
          onPointerUp={() => !isPlaying && handleShowTarget(false)}
          onPointerLeave={() => !isPlaying && handleShowTarget(false)}
          disabled={isPlaying || timeExpired}
          className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Show Target
        </button>
        
        {targetFound ? (
          <button
            onClick={handleNextLevel}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next Level
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isPlaying || !hasSeenTarget}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {timeExpired ? 'Retry' : 'Start'}
          </button>
        )}

        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        Clicks: {clicks}
      </div>

      <div className="mt-2 space-y-2">
        {!hasSeenTarget && !isPlaying && !timeExpired && (
          <div className="p-4 bg-yellow-50 rounded-lg text-center text-sm">
            Please press "Show Target" first to see your target.
          </div>
        )}

        {timeExpired && !targetFound && (
          <div className="p-4 bg-yellow-100 rounded-lg text-center">
            Time's up! Find the target circle.
          </div>
        )}

        {targetFound && (
          <div className="p-4 bg-green-100 rounded-lg text-center">
            <p>Target found!</p>
            <p className="font-semibold">Level Points: {levelScore + (100 * level)}</p>
          </div>
        )}
      </div>
    </div>
  )
}