import { assertEquals } from '@std/assert'
import { versionCommand } from './index.ts'
import { captureConsoleOutput } from '../../utils/test-utils.ts'

Deno.test('version command should have correct name', () => {
	assertEquals(versionCommand.name, 'version')
})

Deno.test('version command should have correct description', () => {
	assertEquals(versionCommand.description, 'Shows the current version')
})

Deno.test('version command should execute without errors', () => {
	versionCommand.execute()
})

Deno.test('version command should print expected version', () => {
	const { output } = captureConsoleOutput(() => {
		versionCommand.execute()
	})

	assertEquals(output, 'Phastos v1.0.0')
})
