/**
 * Utility for testing console output
 */
export function captureConsoleOutput<T>(fn: () => T): { result: T; output: string } {
  const originalLog = console.log;
  let capturedOutput = "";
  
  console.log = (...args: unknown[]) => {
    capturedOutput += args.join(" ") + "\n";
  };
  
  try {
    const result = fn();
    return { result, output: capturedOutput.trim() };
  } finally {
    console.log = originalLog;
  }
} 