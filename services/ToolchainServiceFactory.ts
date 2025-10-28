/**
 * ToolchainServiceFactory
 * Factory pattern to get the appropriate toolchain service based on project configuration
 */

import type { Toolchain } from '../types/Toolchain.ts'
import { nextJSService } from './NextJSService.ts'
import { reactNativeService } from './ReactNativeService.ts'
import { reactRouterService } from './ReactRouterService.ts'
import type { ToolchainService } from './ToolchainService.ts'
import { viteService } from './ViteService.ts'

/**
 * Factory class for creating toolchain services
 */
export class ToolchainServiceFactory {
	/**
	 * Gets the appropriate toolchain service based on the toolchain type
	 * @param toolchain - The toolchain type (react-native, vite, nextjs)
	 * @returns The appropriate toolchain service instance
	 */
	static getService(toolchain?: Toolchain): ToolchainService {
		switch (toolchain) {
			case 'vite':
				return viteService
			case 'nextjs':
				return nextJSService
			case 'react-router':
				return reactRouterService
			case 'react-native':
			default:
				return reactNativeService
		}
	}
}
