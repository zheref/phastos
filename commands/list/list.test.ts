/**
 * Tests for list command
 */

import { assertEquals } from '@std/assert'
import { listCommand } from './index.tsx'

Deno.test('list command should have correct name', () => {
	assertEquals(listCommand.name, 'list')
})

Deno.test('list command should have a description', () => {
	assertEquals(typeof listCommand.description, 'string')
	assertEquals(listCommand.description.length > 0, true)
})

Deno.test('list command should have an execute function', () => {
	assertEquals(typeof listCommand.execute, 'function')
})

Deno.test('list command should have a component', () => {
	assertEquals(typeof listCommand.component, 'function')
})
