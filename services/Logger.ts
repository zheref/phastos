/**
 * Logger
 * Provides structured logging with different log levels for operations
 * Supports observers for real-time UI updates
 */

/**
 * Available log levels
 */
export type LogLevel =
	| 'log'
	| 'info'
	| 'warning'
	| 'verbose'
	| 'failure'
	| 'error'

/**
 * Log entry structure
 */
export interface LogEntry {
	id: string
	timestamp: Date
	level: LogLevel
	message: string
	context?: string
}

/**
 * Observer callback type for log updates
 */
export type LogObserver = (entry: LogEntry) => void

/**
 * Logger class for structured logging
 */
export class Logger {
	private logs: LogEntry[] = []
	private observers: Set<LogObserver> = new Set()
	private logIdCounter = 0
	private context?: string

	/**
	 * Creates a new Logger instance
	 * @param context - Optional context identifier (e.g., project name)
	 */
	constructor(context?: string) {
		this.context = context
	}

	/**
	 * Creates a new log entry
	 */
	private createEntry(level: LogLevel, message: string): LogEntry {
		return {
			id: `log-${++this.logIdCounter}-${Date.now()}`,
			timestamp: new Date(),
			level,
			message,
			context: this.context,
		}
	}

	/**
	 * Adds a log entry and notifies observers
	 */
	private addEntry(entry: LogEntry): void {
		this.logs.push(entry)
		this.notifyObservers(entry)
	}

	/**
	 * Logs a regular message
	 */
	log(message: string): void {
		this.addEntry(this.createEntry('log', message))
	}

	/**
	 * Logs an informational message
	 */
	info(message: string): void {
		this.addEntry(this.createEntry('info', message))
	}

	/**
	 * Logs a warning message
	 */
	warning(message: string): void {
		this.addEntry(this.createEntry('warning', message))
	}

	/**
	 * Logs a verbose/debug message
	 */
	verbose(message: string): void {
		this.addEntry(this.createEntry('verbose', message))
	}

	/**
	 * Logs a failure message
	 */
	failure(message: string): void {
		this.addEntry(this.createEntry('failure', message))
	}

	/**
	 * Logs an error message
	 */
	error(message: string, error?: Error | string): void {
		const errorMessage = error
			? `${message}: ${error instanceof Error ? error.message : error}`
			: message
		this.addEntry(this.createEntry('error', errorMessage))
	}

	/**
	 * Registers an observer to receive log updates
	 */
	subscribe(observer: LogObserver): () => void {
		this.observers.add(observer)
		// Return unsubscribe function
		return () => {
			this.observers.delete(observer)
		}
	}

	/**
	 * Notifies all observers of a new log entry
	 */
	private notifyObservers(entry: LogEntry): void {
		this.observers.forEach((observer) => observer(entry))
	}

	/**
	 * Gets all log entries
	 */
	getLogs(): LogEntry[] {
		return [...this.logs]
	}

	/**
	 * Gets logs filtered by level
	 */
	getLogsByLevel(level: LogLevel): LogEntry[] {
		return this.logs.filter((log) => log.level === level)
	}

	/**
	 * Clears all logs
	 */
	clear(): void {
		this.logs = []
	}

	/**
	 * Gets the number of logs
	 */
	getCount(): number {
		return this.logs.length
	}

	/**
	 * Gets the context identifier
	 */
	getContext(): string | undefined {
		return this.context
	}

	/**
	 * Sets a new context
	 */
	setContext(context: string): void {
		this.context = context
	}

	/**
	 * Creates a child logger with a sub-context
	 */
	child(subContext: string): Logger {
		const fullContext = this.context
			? `${this.context}:${subContext}`
			: subContext
		const childLogger = new Logger(fullContext)

		// Child logger shares the same logs array and observers
		childLogger.logs = this.logs
		childLogger.observers = this.observers
		childLogger.logIdCounter = this.logIdCounter

		return childLogger
	}
}
