import { Command } from "../types/command.ts";

export const helloCommand: Command = {
  name: "hello",
  description: "Prints a greeting message",
  execute: () => {
    console.log("Hello from Phastos");
  },
}; 