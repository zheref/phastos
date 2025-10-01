/**
 * Tests for run command
 */

import { assertEquals } from '@std/assert'
import { runCommand } from './index.tsx'

Deno.test('run command should have correct name', () => {
	assertEquals(runCommand.name, 'run')
})

Deno.test('run command should have a description', () => {
	assertEquals(typeof runCommand.description, 'string')
	assertEquals(runCommand.description.length > 0, true)
})

Deno.test('run command should have an execute function', () => {
	assertEquals(typeof runCommand.execute, 'function')
})

Deno.test('run command should have a component', () => {
	assertEquals(typeof runCommand.component, 'function')
})
