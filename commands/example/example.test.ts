import { assertEquals } from '@std/assert'
import { exampleCommand } from './index.tsx'

Deno.test('example command should have correct name', () => {
	assertEquals(exampleCommand.name, 'example')
})

Deno.test('example command should have correct description', () => {
	assertEquals(
		exampleCommand.description,
		'Demonstrates how to create custom commands',
	)
})

Deno.test('example command should have a component', () => {
	assertEquals(typeof exampleCommand.component, 'function')
})

Deno.test('example command component should be callable', () => {
	const component = exampleCommand.component!
	const result = component()
	assertEquals(typeof result, 'object')
})
