"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Settings, Clock } from "lucide-react"

type TimerState = "idle" | "work" | "break" | "paused"

export function ProductivityTimer() {
  // Timer settings
  const [workMinutes, setWorkMinutes] = useState(45)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [totalIntervals, setTotalIntervals] = useState(4)

  // Timer state
  const [currentInterval, setCurrentInterval] = useState(1)
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60)
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create a buzzer sound using Web Audio API
    const createBuzzerSound = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      return () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Buzzer frequency and pattern
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioRef.current = { play: createBuzzerSound() } as any
    } catch  {
      console.log("Audio context not available")
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (timerState === "work" || timerState === "break") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState])

  const handleTimerComplete = () => {
    if (audioRef.current && audioRef.current.play) {
      try {
        audioRef.current.play()
      } catch  {
        console.log("Could not play buzzer sound")
      }
    }

    if (timerState === "work") {
      if (currentInterval < totalIntervals) {
        // Start break
        setTimerState("break")
        setTimeLeft(breakMinutes * 60)
      } else {
        // All intervals complete
        setTimerState("idle")
        setCurrentInterval(1)
        setTimeLeft(workMinutes * 60)
      }
    } else if (timerState === "break") {
      // Start next work interval
      setCurrentInterval((prev) => prev + 1)
      setTimerState("work")
      setTimeLeft(workMinutes * 60)
    }
  }

  const startTimer = () => {
    if (timerState === "idle") {
      setTimerState("work")
      setTimeLeft(workMinutes * 60)
    } else if (timerState === "paused") {
      setTimerState(timerState === "paused" ? "work" : "break")
    }
  }

  const pauseTimer = () => {
    setTimerState("paused")
  }

  const resetTimer = () => {
    setTimerState("idle")
    setCurrentInterval(1)
    setTimeLeft(workMinutes * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCurrentDuration = () => {
    return timerState === "break" ? breakMinutes * 60 : workMinutes * 60
  }

  const getProgress = () => {
    const totalTime = getCurrentDuration()
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const isActive = timerState === "work" || timerState === "break"
  const isPaused = timerState === "paused"

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 text-balance">
          Productivity Timer
        </h1>
        <p className="text-slate-600 text-lg text-pretty">Stay focused with customizable work and break intervals</p>
      </div>

      <Card className="mb-6 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <Badge
              variant={timerState === "work" ? "default" : timerState === "break" ? "secondary" : "outline"}
              className={
                timerState === "work"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : timerState === "break"
                    ? "bg-teal-600 hover:bg-teal-700"
                    : ""
              }
            >
              {timerState === "work" ? "Work Time" : timerState === "break" ? "Break Time" : "Ready to Start"}
            </Badge>
          </div>
          <CardTitle className="text-7xl font-mono bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 font-bold">
            {formatTime(timeLeft)}
          </CardTitle>
          <div className="w-full h-3 bg-slate-200 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${isActive ? getProgress() : 0}%` }}
            />
          </div>
          <div className="text-sm text-slate-600 font-medium">
            Interval {currentInterval} of {totalIntervals}
          </div>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex gap-3 justify-center mb-4">
            {!isActive && !isPaused ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Timer
              </Button>
            ) : isPaused ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="lg" className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}

            <Button
              onClick={resetTimer}
              size="lg"
              className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Button
              onClick={() => setShowSettings(!showSettings)}
              size="lg"
              className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-lg"
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {showSettings && (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700">Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-minutes" className="text-slate-700 font-medium">
                  Work Duration (minutes)
                </Label>
                <Input
                  id="work-minutes"
                  type="number"
                  min="1"
                  max="120"
                  value={workMinutes}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 1
                    setWorkMinutes(value)
                    if (timerState === "idle") {
                      setTimeLeft(value * 60)
                    }
                  }}
                  className="bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="break-minutes" className="text-slate-700 font-medium">
                  Break Duration (minutes)
                </Label>
                <Input
                  id="break-minutes"
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number.parseInt(e.target.value) || 1)}
                  className="bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-intervals" className="text-slate-700 font-medium">
                  Total Intervals
                </Label>
                <Input
                  id="total-intervals"
                  type="number"
                  min="1"
                  max="20"
                  value={totalIntervals}
                  onChange={(e) => setTotalIntervals(Number.parseInt(e.target.value) || 1)}
                  className="bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="text-sm text-slate-600 bg-white/50 p-4 rounded-lg border border-white/30">
              <p className="font-medium mb-2 text-slate-700">Current Configuration:</p>
              <ul className="space-y-1">
                <li>• Work sessions: {workMinutes} minutes each</li>
                <li>• Break sessions: {breakMinutes} minutes each</li>
                <li>• Total intervals: {totalIntervals}</li>
                <li>
                  • Total time: {Math.ceil(((workMinutes + breakMinutes) * totalIntervals) / 60)} hours{" "}
                  {((workMinutes + breakMinutes) * totalIntervals) % 60} minutes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
