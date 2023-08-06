#! /usr/bin/env node

import figlet from "figlet";
import { CLI_NAME, NAME, VERSION } from "./config.js";
import { Command } from "commander";
import run from "./index.js";
import chalk from "chalk";

const cli = () => {
  const program = new Command();

  console.log("\n");

  console.log("\n");

  program
    .version(VERSION)
    .name(CLI_NAME)
    .description("A tool to convert and resize your images using Sharp.")
    .requiredOption(
      "-s, --source <source>",
      "Source folder with images to convert"
    )
    .requiredOption(
      "-t, --target <target>",
      "Target folder for converted images"
    )
    .option(
      "-i, --inputFormats [formats...]",
      "List of input formats to convert",
      ["jpeg", "jpg", "png"]
    )
    .option(
      "-o, --outputFormats [formats...]",
      "List of output formats to convert to",
      ["webp"]
    )
    .option("-w, --widths [widths...]", "List of widths to resize to", [])
    .option(
      "-e, --enlarge",
      "Enlarge images smaller than specified width",
      false
    )
    .option("-c, --clear", "Clear target folder before converting", false)
    .option("-v, --verbose", "Show verbose output", false)
    .option("-d, --debug", "Show debug output", false)
    .addHelpText(
      "beforeAll",
      chalk.magenta.bold(
        figlet.textSync(NAME, { horizontalLayout: "full" }),
        "\n"
      )
    )
    .showHelpAfterError("(add --help for additional information)");

  if (process.argv.slice(2).length === 0) {
    program.help();
  }

  program.parse(process.argv);

  const options = program.opts();

  run(options as any);
};

cli();
