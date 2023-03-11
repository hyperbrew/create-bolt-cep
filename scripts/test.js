const { execSync } = require("child_process");
const { existsSync, removeSync } = require("fs-extra");

// NOTE: --template demo will always default to id: 'com.bolt.cep' and displayName: 'Bolt CEP'

main();

// prettier-ignore
async function main() {
  if (existsSync("test")) removeSync("test");

  // should create a new demo bolt project with svelte
  await run("node dist/index.js test/svelte-demo --template demo -f svelte");

  // should create a new demo bolt project with react (ignoring -a flag)
  await run("node dist/index.js test/react-demo --template demo --framework react -a aeft ppro");

  // should create a new demo bolt project with vue (ignoring --apps flag)
  await run("node dist/index.js test/vue-demo --template demo -f vue --apps aeft ppro");

  // should create a new skeleton bolt project with svelte
  await run("node dist/index.js test/svelte-skeleton -t skeleton -f svelte --apps aeft anim");

  // should create a new skeleton bolt project with react
  await run("node dist/index.js test/react-skeleton -t skeleton -f react -a aeft ilst phxs");

  // should create a new skeleton bolt project with vue
  await run("node dist/index.js test/vue-skeleton -t skeleton -f vue -a aeft ppro");

  // should create a new demo bolt project with defaults
  await run("node dist/index.js test/default-demo -t demo");

  // should create a new skeleton bolt project with defaults
  await run("node dist/index.js test/default-skeleton -t skeleton");
}

async function run(command) {
  await execSync(command + " -i", { stdio: "inherit" });
}
