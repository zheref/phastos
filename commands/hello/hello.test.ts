import { assertEquals } from "@std/assert";
import { helloCommand } from "./index.ts";
import { captureConsoleOutput } from "../../utils/test-utils.ts";

Deno.test("hello command should have correct name", () => {
  assertEquals(helloCommand.name, "hello");
});

Deno.test("hello command should have correct description", () => {
  assertEquals(helloCommand.description, "Prints a greeting message");
});

Deno.test("hello command should execute without errors", () => {
  // This test ensures the command can be executed without throwing
  helloCommand.execute();
});

Deno.test("hello command should print expected message", () => {
  const { output } = captureConsoleOutput(() => {
    helloCommand.execute();
  });
  
  assertEquals(output, "Hello from Phastos");
}); 