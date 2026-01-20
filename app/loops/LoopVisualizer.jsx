"use client";

import { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronRight, Lightbulb, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoopVisualizer() {
  const [code, setCode] = useState('for i in range(5):\n    print(i)');
  const [output, setOutput] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [variables, setVariables] = useState({});
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(1000);

  const examples = [
    {
      name: 'Basic For Loop',
      code: 'for i in range(5):\n    print(i)'
    },
    {
      name: 'For Loop with Step',
      code: 'for i in range(0, 10, 2):\n    print(i)'
    },
    {
      name: 'While Loop Counter',
      code: 'count = 0\nwhile count < 5:\n    print(count)\n    count = count + 1'
    },
    {
      name: 'Sum Calculator',
      code: 'total = 0\nfor i in range(1, 6):\n    total = total + i\n    print(f"Sum so far: {total}")'
    }
  ];

  const parseAndExecute = (codeString) => {
    setError('');
    const lines = codeString.split('\n');
    const steps = [];
    const vars = {};
    let outputBuffer = [];

    try {
      // Simple parser for basic for and while loops
      let i = 0;
      const executeLines = (startLine, endLine, loopVars = {}) => {
        const localVars = { ...vars, ...loopVars };
        
        for (let lineNum = startLine; lineNum < endLine; lineNum++) {
          const line = lines[lineNum].trim();
          
          if (!line || line.startsWith('#')) continue;

          // Handle print statements
          if (line.includes('print(')) {
            const match = line.match(/print\((.*?)\)/);
            if (match) {
              let content = match[1].trim();
              const endMatch = line.match(/end\s*=\s*"(.*)"/);
              const hasNewline = !endMatch;
              
              // Handle f-strings
              if (content.startsWith('f"') || content.startsWith("f'")) {
                content = content.slice(2, -1);
                Object.keys(localVars).forEach(key => {
                  content = content.replace(`{${key}}`, localVars[key]);
                });
              } else if (content.startsWith('"') || content.startsWith("'")) {
                content = content.slice(1, -1);
              } else if (localVars[content] !== undefined) {
                content = localVars[content];
              }
              
              outputBuffer.push({ text: String(content), newline: hasNewline });
            }
          }
          
          // Handle variable assignment
          const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
          if (assignMatch && !line.includes('for') && !line.includes('while')) {
            const varName = assignMatch[1];
            const expression = assignMatch[2];
            
            try {
              const result = evaluateExpression(expression, localVars);
              localVars[varName] = result;
              vars[varName] = result;
            } catch (e) {
              throw new Error(`Error evaluating: ${line}`);
            }
          }
          
          steps.push({
            line: lineNum,
            variables: { ...localVars },
            output: [...outputBuffer]
          });
        }
      };

      const evaluateExpression = (expr, vars) => {
        expr = expr.trim();
        
        // Handle simple arithmetic
        Object.keys(vars).forEach(key => {
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          expr = expr.replace(regex, vars[key]);
        });
        
        try {
          return eval(expr);
        } catch {
          return expr;
        }
      };

      let lineIndex = 0;
      while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        
        if (!line || line.startsWith('#')) {
          lineIndex++;
          continue;
        }

        // Handle for loops
        const forMatch = line.match(/for\s+(\w+)\s+in\s+range\((.*?)\):/);
        if (forMatch) {
          const varName = forMatch[1];
          const rangeArgs = forMatch[2].split(',').map(x => {
            const trimmed = x.trim();
            return vars[trimmed] !== undefined ? vars[trimmed] : parseInt(trimmed);
          });
          
          let start = 0, stop = 0, step = 1;
          if (rangeArgs.length === 1) {
            stop = rangeArgs[0];
          } else if (rangeArgs.length === 2) {
            start = rangeArgs[0];
            stop = rangeArgs[1];
          } else if (rangeArgs.length === 3) {
            start = rangeArgs[0];
            stop = rangeArgs[1];
            step = rangeArgs[2];
          }

          // Find loop body
          let bodyEnd = lineIndex + 1;
          while (bodyEnd < lines.length && (lines[bodyEnd].startsWith('    ') || !lines[bodyEnd].trim())) {
            if (lines[bodyEnd].trim()) bodyEnd++;
            else break;
          }

          // Execute loop
          for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
            executeLines(lineIndex + 1, bodyEnd, { [varName]: i });
          }
          
          lineIndex = bodyEnd;
          continue;
        }

        // Handle while loops
        const whileMatch = line.match(/while\s+(.+):/);
        if (whileMatch) {
          const condition = whileMatch[1];
          
          let bodyEnd = lineIndex + 1;
          while (bodyEnd < lines.length && (lines[bodyEnd].startsWith('    ') || !lines[bodyEnd].trim())) {
            if (lines[bodyEnd].trim()) bodyEnd++;
            else break;
          }

          let iterations = 0;
          const maxIterations = 1000;
          
          while (iterations < maxIterations) {
            const conditionResult = evaluateExpression(condition, vars);
            if (!conditionResult) break;
            
            executeLines(lineIndex + 1, bodyEnd);
            iterations++;
          }
          
          if (iterations >= maxIterations) {
            throw new Error('Infinite loop detected!');
          }
          
          lineIndex = bodyEnd;
          continue;
        }

        // Handle standalone statements
        executeLines(lineIndex, lineIndex + 1);
        lineIndex++;
      }

      return { steps, finalVars: vars };
      
    } catch (e) {
      setError(e.message);
      return { steps: [], finalVars: {} };
    }
  };

  const runCode = () => {
    const result = parseAndExecute(code);
    if (result.steps.length > 0) {
      setOutput([]);
      setVariables({});
      setCurrentStep(0);
      setIsRunning(true);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setOutput([]);
    setVariables({});
    setError('');
  };

  useEffect(() => {
    if (!isRunning) return;

    const result = parseAndExecute(code);
    if (currentStep < result.steps.length) {
      const timer = setTimeout(() => {
        const step = result.steps[currentStep];
        setVariables(step.variables);
        setOutput(step.output);
        setCurrentStep(currentStep + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, speed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <button className="mb-4 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </Link>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Lightbulb className="w-8 h-8" />
              Python Loop Visualizer
            </h1>
            <p className="text-blue-100 mt-2">Write loops and watch them execute step-by-step!</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Code Editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-gray-700">Python Code</label>
                  <div className="flex gap-2">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </button>
                    <button
                      onClick={reset}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-900"
                  spellCheck="false"
                />

                <div className="mt-4">
                  <label className="font-semibold text-gray-700 block mb-2">Speed</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 text-center mt-1">
                    {speed}ms per step
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </div>

              {/* Visualization */}
              <div>
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Variables</h3>
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 min-h-24">
                    {Object.keys(variables).length === 0 ? (
                      <p className="text-gray-400 italic">No variables yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(variables).map(([key, value]) => (
                          <div key={key} className="bg-white p-3 rounded-lg shadow-sm border border-purple-200">
                            <div className="text-xs text-purple-600 font-semibold">{key}</div>
                            <div className="text-lg font-bold text-purple-900">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Output</h3>
                  <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg min-h-48 max-h-64 overflow-auto">
                    {output.length === 0 ? (
                      <p className="text-gray-500 italic">Output will appear here...</p>
                    ) : (
                      <pre className="whitespace-pre-wrap">
                        {output.map((item, idx) => (
                          <span key={idx}>
                            {item.text}
                            {item.newline ? '\n' : ''}
                          </span>
                        ))}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">Example Loops</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCode(example.code);
                      reset();
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-blue-600" />
            Tips for Students
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Try the examples first to see how loops work</li>
            <li>• Watch how variables change with each loop iteration</li>
            <li>• Adjust the speed slider to see loops in slow motion</li>
            <li>• For loops are great when you know how many times to repeat</li>
            <li>• While loops are perfect when you repeat until a condition is met</li>
          </ul>
        </div>
      </div>
    </div>
  );
};