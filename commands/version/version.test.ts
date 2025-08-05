import { assertEquals } from '@std/assert'
import { versionCommand } from './index.tsx'

Deno.test('version command should have correct name', () => {
	assertEquals(versionCommand.name, 'version')
})

Deno.test('version command should have correct description', () => {
	assertEquals(versionCommand.description, 'Shows the current version')
})

Deno.test('version command should have a component', () => {
	assertEquals(typeof versionCommand.component, 'function')
})

Deno.test('version command component should be callable', () => {
	const component = versionCommand.component!
	const result = component()
	assertEquals(typeof result, 'object')
})
