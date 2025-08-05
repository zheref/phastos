import { assertEquals } from '@std/assert'
import { helloCommand } from './index.tsx'

Deno.test('hello command should have correct name', () => {
	assertEquals(helloCommand.name, 'hello')
})

Deno.test('hello command should have correct description', () => {
	assertEquals(helloCommand.description, 'Prints a greeting message')
})

Deno.test('hello command should have a component', () => {
	assertEquals(typeof helloCommand.component, 'function')
})

Deno.test('hello command component should be callable', () => {
	const component = helloCommand.component!
	const result = component()
	assertEquals(typeof result, 'object')
})
