#!/usr/bin/env node

import chalk from "chalk";
import { exec } from "child_process";
import figlet from "figlet";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

const sleep = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await intro();

  await sleep();

  const pluginsSelected = await askPlugins();

  await installPlugins(pluginsSelected);

  await prismaMigrate();

  await finished();
}

async function intro() {
  console.log(
    chalk.yellow("This is Webie!"),
    chalk.gray("[All the web functions you need!]"),
    "\n"
  );
  console.log(
    "Webie comes with user management system. You could build with these core plugins to ship ahora!\n\n",
    chalk.gray("1. Blog\n"),
    chalk.gray("2. E-commerce\n"),
    chalk.gray("3. Database\n")
  );
  console.log(
    chalk.bgBlueBright(
      "You could at any time run `npx webie add` to add more plugins to your project!\n"
    )
  );
}

async function askPlugins() {
  const pluginsSelected = await inquirer.prompt([
    {
      name: "plugins",
      type: "checkbox",
      message: "Choose the plugins you want to install",
      choices: [{ name: "Blog" }, { name: "E-commerce" }, { name: "Database" }],
    },
  ]);

  const confirmed = await inquirer.prompt([
    {
      name: "confirm",
      type: "confirm",
      message:
        "Do you want to install these plugins?\n" +
        `${chalk.cyan(pluginsSelected.plugins.join(", "))}`,
    },
  ]);

  if (confirmed.confirm) {
    return pluginsSelected;
  } else {
    console.log("Exiting...");
    process.exit(0);
  }
}

async function installPlugins(pluginsSelected) {
  const installSpinner = createSpinner("Installing plugins...");
  try {
    installSpinner.start();
    await sleep(2000);
    installSpinner.success({
      text: `Plugins installed! ${chalk.cyan(
        pluginsSelected.plugins.join(", ")
      )}`,
    });
  } catch (error) {
    installSpinner.error({ text: "Failed to install plugins" });
    console.error(error);

    process.exit(1);
  }
}

async function prismaMigrate() {
  const prismaSpinner = createSpinner("Migrating database...");
  try {
    prismaSpinner.start();
    const result = await runCommand(
      "npx prisma generate && npx prisma db push"
    );
    prismaSpinner.success({ text: "Database migrated!" });
    console.log(result);

    process.exit(0);
  } catch (error) {
    prismaSpinner.error({ text: "Failed to migrate database" });
    console.error(error);

    process.exit(1);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function finished() {
  let msg = `Enjoy Your Webie`;

  const data = figlet.textSync(msg, {
    font: "Colossal",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  });

  console.log(chalk.green(data));
}

main();
