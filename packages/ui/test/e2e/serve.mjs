#!/usr/bin/env node
// Static server for the e2e tests: the repo root, the component cards (/__card/<Name>) and the fixture harness
// (/packages/ui/test/e2e/.harness/index.html). Started by playwright.config.ts.
import { serve } from "../../../../scripts/capture-previews.mjs";
const port = Number(process.env.PORT || 4317);
const srv = await serve(port);
console.log(`e2e server on http://127.0.0.1:${srv.address().port}`);
