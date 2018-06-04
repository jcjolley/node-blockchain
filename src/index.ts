import { junk } from "./blockchain";

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