import { junk } from "./lib/util";

junk();

async function goForever() {
  while (true) {
    await new Promise(resolve => {
      setTimeout(() => {
        console.log(`I'm doing science`)
        resolve(true);
      }, 5000);
    });
  }
}

goForever();