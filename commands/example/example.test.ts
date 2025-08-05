import { assertEquals } from '@std/assert'
import { exampleCommand } from './index.ts'
import { captureConsoleOutput } from '../../utils/test-utils.ts'

Deno.test('example command should have correct name', () => {
	assertEquals(exampleCommand.name, 'example')
})

Deno.test('example command should have correct description', () => {
	assertEquals(
		exampleCommand.description,
		'Demonstrates how to create custom commands',
	)
})

Deno.test('example command should execute without errors', () => {
	exampleCommand.execute()
})

Deno.test('example command should print expected output', () => {
	const { output } = captureConsoleOutput(() => {
		exampleCommand.execute()
	})

	const expectedOutput = `This is an example command!
You can add any logic here:
- API calls
- File operations
- Data processing
- And much more!`

	assertEquals(output, expectedOutput)
})
