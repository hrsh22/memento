import { readChain } from "../src/lib/server/filecoin";
console.log(JSON.stringify(await readChain(), null, 2));
