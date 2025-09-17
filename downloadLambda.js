// downloadLambda.js
// Usage: node downloadLambda.js [region] [outputDir]

import { LambdaClient, ListFunctionsCommand, GetFunctionCommand } from "@aws-sdk/client-lambda";
import axios from "axios";
import fs from "fs";
import path from "path";

const region = process.argv[2] || process.env.AWS_REGION || "us-east-1";
const outputDir = process.argv[3] || "lambdas";

const client = new LambdaClient({ region });

async function downloadAllLambdas() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let nextMarker;
  let count = 0;

  do {
    const listResp = await client.send(new ListFunctionsCommand({ Marker: nextMarker }));
    const functions = listResp.Functions ?? [];

    for (const fn of functions) {
      const name = fn.FunctionName;
      const pkgType = fn.PackageType || "Zip";
      const filePath = path.join(outputDir, `${name}.zip`);

      if (pkgType === "Image") {
        console.log(`[IMAGE] ${name} uses container image, skipping ZIP download.`);
        continue;
      }

      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${name} (already downloaded)`);
        continue;
      }

      try {
        console.log(`📥 Fetching ${name}...`);
        const getResp = await client.send(new GetFunctionCommand({ FunctionName: name }));
        const url = getResp?.Code?.Location;

        if (!url) {
          console.warn(`⚠️  No Code.Location for ${name}. Skipping.`);
          continue;
        }

        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, res.data);
        console.log(`✅ Downloaded ${filePath}`);
        count++;
      } catch (err) {
        console.error(`❌ Failed to download ${name}:`, err.message || err);
      }
    }

    nextMarker = listResp.NextMarker;
  } while (nextMarker);

  console.log(`\n🎉 Done. Downloaded ${count} Lambda ZIP package(s) from region ${region} into ./${outputDir}`);
}

downloadAllLambdas().catch((e) => {
  console.error("❌ Fatal error:", e?.message || e);
  process.exit(1);
});
