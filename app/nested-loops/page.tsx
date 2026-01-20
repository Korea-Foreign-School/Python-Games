'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NestedLoopsGuide() {
  const [activeExample, setActiveExample] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [currentLine, setCurrentLine] = useState(-1);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const intervalRef = useRef<any>(null);
  
  const examples = [
    {
      title: "🍕 Pizza Party",
      description: "You're delivering pizza to 3 friends, and each friend wants 4 slices!",
      outerLoop: "friends",
      innerLoop: "slices",
      outerCount: 3,
      innerCount: 4,
      emoji: "🍕",
      code: [
        "for friend in range(3):",
        "    for slice in range(4):",
        "        print('Friend', friend+1, 'gets slice', slice+1)"
      ],
      getOutput: (outer: number, inner: number) => `Friend ${outer+1} gets slice ${inner+1}\n`,
      explanation: "The outer loop goes through each friend (3 times). For EACH friend, the inner loop gives them 4 slices. Total: 3 × 4 = 12 slices!"
    },
    {
      title: "🎮 Gaming Grid",
      description: "Creating a 5×5 game board with treasure locations!",
      outerLoop: "rows",
      innerLoop: "columns",
      outerCount: 5,
      innerCount: 5,
      emoji: "💎",
      code: [
        "for row in range(5):",
        "    for col in range(5):",
        "        print('(', row, ',', col, ')', end=' ')",
        "    print()  # New line after each row"
      ],
      getOutput: (outer: any, inner: any, isEndOfRow: any) => {
        if (isEndOfRow) return `(${outer},${inner}) \n`;
        return `(${outer},${inner}) `;
      },
      explanation: "The outer loop creates each row (5 times). For EACH row, the inner loop creates 5 columns. This makes a 5×5 grid!"
    },
    {
      title: "🎵 Music Playlist",
      description: "You have 3 playlists, each with 3 songs!",
      outerLoop: "playlists",
      innerLoop: "songs",
      outerCount: 3,
      innerCount: 3,
      emoji: "🎵",
      code: [
        "for playlist in range(3):",
        "    for song in range(3):",
        "        print('Playlist', playlist+1, 'Song', song+1)"
      ],
      getOutput: (outer: number, inner: number) => `Playlist ${outer+1} Song ${inner+1}\n`,
      explanation: "The outer loop picks a playlist (3 times). For EACH playlist, the inner loop plays all 3 songs. Total: 9 songs!"
    }
  ];

  const currentExample = examples[activeExample];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    if (isPaused) {
      setIsPaused(false);
      continueAnimation();
    } else {
      setIsAnimating(true);
      setIsPaused(false);
      setAnimationStep(0);
      setConsoleOutput([]);
      setCurrentLine(-1);
      continueAnimation();
    }
  };

  const continueAnimation = () => {
    const totalSteps = currentExample.outerCount * currentExample.innerCount;
    let step = animationStep;
    
    intervalRef.current = setInterval(() => {
      step++;
      
      const outerIndex = Math.floor((step - 1) / currentExample.innerCount);
      const innerIndex = (step - 1) % currentExample.innerCount;
      
      // Determine which line is executing
      if (step === 1 && innerIndex === 0) {
        setCurrentLine(0); // First line of outer loop
      } else if (innerIndex === 0) {
        setCurrentLine(1); // Inner loop line
      } else {
        setCurrentLine(2); // Print line
      }
      
      setAnimationStep(step);
      
      // Add to console
      const isEndOfRow = (innerIndex === currentExample.innerCount - 1);
      const output = currentExample.getOutput ? 
        currentExample.getOutput(outerIndex, innerIndex, isEndOfRow) : 
        `Output ${step}`;
      setConsoleOutput(prev => [...prev, output]);
      
      if (step >= totalSteps) {
        clearInterval(intervalRef.current);
        setCurrentLine(-1);
        setTimeout(() => {
          setIsAnimating(false);
          setIsPaused(false);
        }, 1000);
      }
    }, 800);
  };

  const pauseAnimation = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setAnimationStep(0);
    setCurrentLine(-1);
    setConsoleOutput([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const renderGrid = () => {
    const cells = [];
    let cellIndex = 0;
    
    for (let outer = 0; outer < currentExample.outerCount; outer++) {
      const row = [];
      for (let inner = 0; inner < currentExample.innerCount; inner++) {
        cellIndex++;
        const isActive = isAnimating && cellIndex === animationStep;
        const isPast = cellIndex <= animationStep;
        
        row.push(
          <div
            key={`${outer}-${inner}`}
            className={`w-12 h-12 border-2 flex items-center justify-center text-xl transition-all duration-300 ${
              isActive ? 'bg-yellow-300 border-yellow-500 scale-110' : 
              isPast ? 'bg-green-200 border-green-400' : 
              'bg-white border-gray-300'
            }`}
          >
            {isPast && currentExample.emoji}
          </div>
        );
      }
      cells.push(
        <div key={outer} className="flex gap-1 mb-1">
          {row}
        </div>
      );
    }
    
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <button className="mb-4 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </Link>

        <h1 className="text-4xl font-bold text-center mb-2 text-purple-800">
          Nested Loops Adventure! 🚀
        </h1>
        <p className="text-center text-gray-700 mb-8">
          A loop inside a loop - let's make it fun!
        </p>

        {/* Example Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveExample(idx);
                resetAnimation();
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeExample === idx
                  ? 'bg-purple-600 text-white scale-105'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">
            {currentExample.title}
          </h2>
          <p className="text-lg mb-6 text-gray-700">{currentExample.description}</p>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Side: Code and Visual */}
            <div>
              {/* Code Display */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <pre className="font-mono text-sm">
                  {currentExample.code.map((line, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-300 ${
                        currentLine === idx
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>

              {/* Visual Grid */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-semibold text-gray-600">
                    {isAnimating || isPaused ? (
                      <>Step {animationStep} of {currentExample.outerCount * currentExample.innerCount}</>
                    ) : (
                      'Click Play to start!'
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isAnimating || isPaused ? (
                      <button
                        onClick={startAnimation}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Play size={16} /> {isPaused ? 'Resume' : 'Play'}
                      </button>
                    ) : (
                      <button
                        onClick={pauseAnimation}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Pause size={16} /> Pause
                      </button>
                    )}
                    <button
                      onClick={resetAnimation}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <RotateCcw size={16} /> Reset
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div>{renderGrid()}</div>
                </div>
              </div>
            </div>

            {/* Right Side: Console Output */}
            <div>
              <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
                <div className="text-green-400 font-bold mb-2 text-sm border-b border-gray-700 pb-2">
                  📺 CONSOLE OUTPUT
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-sm text-green-300 space-y-1 whitespace-pre-wrap">
                  {consoleOutput.length === 0 ? (
                    <div className="text-gray-500 italic">
                      Output will appear here when you run the code...
                    </div>
                  ) : (
                    consoleOutput.map((output, idx) => (
                      <span
                        key={idx}
                        className={`transition-all duration-300 ${
                          idx === consoleOutput.length - 1 && isAnimating
                            ? 'text-yellow-300 font-bold'
                            : ''
                        }`}
                      >
                        {output}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
            <h3 className="font-bold text-blue-800 mb-2">How it works:</h3>
            <p className="text-blue-900">{currentExample.explanation}</p>
          </div>
        </div>

        {/* Key Concept Box */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-3">🔑 The Big Idea</h3>
          <p className="text-lg mb-2">
            A nested loop is like a loop inside another loop!
          </p>
          <ul className="space-y-2 ml-4">
            <li>✨ The <strong>outer loop</strong> runs first</li>
            <li>✨ For EACH time the outer loop runs, the <strong>inner loop</strong> completes ALL its repetitions</li>
            <li>✨ Total repetitions = outer × inner (multiplication!)</li>
          </ul>
          <div className="mt-4 bg-white text-black bg-opacity-20 rounded p-3">
            <p className="font-semibold">Think of it like this:</p>
            <p>Reading a book (outer loop: chapters) where each chapter (inner loop: pages) has multiple pages!</p>
          </div>
        </div>
      </div>
    </div>
  );
}