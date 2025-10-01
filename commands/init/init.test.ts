/**
 * Tests for init command
 */

import { assertEquals } from '@std/assert'
import { initCommand } from './index.tsx'

Deno.test('init command should have correct name', () => {
	assertEquals(initCommand.name, 'init')
})

Deno.test('init command should have a description', () => {
	assertEquals(typeof initCommand.description, 'string')
	assertEquals(initCommand.description.length > 0, true)
})

Deno.test('init command should have an execute function', () => {
	assertEquals(typeof initCommand.execute, 'function')
})

Deno.test('init command should have a component', () => {
	assertEquals(typeof initCommand.component, 'function')
})
