// download-stepfn-lambda.js
// Usage: node download-stepfn-lambda.js <stateMachineArn> [region]

import { SFNClient, DescribeStateMachineCommand } from "@aws-sdk/client-sfn";
import { LambdaClient, GetFunctionCommand } from "@aws-sdk/client-lambda";
import axios from "axios";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const stateMachineArn = process.argv[2];
const region = process.argv[3] || process.env.AWS_REGION || "us-east-1";

if (!stateMachineArn) {
  console.error("❌ Provide the Step Function ARN: node download-stepfn-lambda.js <stateMachineArn> [region]");
  process.exit(1);
}

const downloadDir = "stepfn-lambdas";
const extractDir = "lambda-mods";

// ensure output folders exist
for (const dir of [downloadDir, extractDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sfn = new SFNClient({ region });
const lambda = new LambdaClient({ region });

function extractLambdaArns(definitionJson) {
  const arns = new Set();
  function recurse(obj) {
    if (obj && typeof obj === "object") {
      if (obj.Resource && typeof obj.Resource === "string" && obj.Resource.includes(":lambda:")) {
        arns.add(obj.Resource);
      }
      for (const val of Object.values(obj)) recurse(val);
    }
  }
  recurse(definitionJson);
  return [...arns];
}

async function downloadAndExtractLambda(arn) {
  const fnName = arn.split(":").pop();
  const zipPath = path.join(downloadDir, `${fnName}.zip`);
  const fnDir = path.join(extractDir, fnName);

  if (fs.existsSync(fnDir)) {
    console.log(`⏭️  Skipping ${fnName} (already extracted)`);
    return;
  }

  try {
    console.log(`📥 Fetching ${fnName}...`);
    const resp = await lambda.send(new GetFunctionCommand({ FunctionName: arn }));

    if (resp.Configuration?.PackageType === "Image") {
      console.log(`[IMAGE] ${fnName} uses container image, skipping ZIP download.`);
      return;
    }

    // download zip if not cached
    if (!fs.existsSync(zipPath)) {
      const url = resp.Code?.Location;
      if (!url) throw new Error("No Code.Location found");
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(zipPath, res.data);
      console.log(`✅ Downloaded ${zipPath}`);
    } else {
      console.log(`ℹ️  Using cached ZIP: ${zipPath}`);
    }

    // extract into folder
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(fnDir, true);
    console.log(`📂 Extracted into ${fnDir}`);
  } catch (err) {
    console.error(`❌ Failed to process ${fnName}:`, err.message || err);
  }
}

async function main() {
  try {
    // 1. fetch state machine definition
    const { definition } = await sfn.send(new DescribeStateMachineCommand({ stateMachineArn }));
    const defJson = JSON.parse(definition);

    // 2. extract lambda ARNs
    const arns = extractLambdaArns(defJson);
    console.log(`🔍 Found ${arns.length} Lambda function(s) in Step Function.`);

    // 3. download + extract
    for (const arn of arns) {
      await downloadAndExtractLambda(arn);
    }

    console.log("\n🎉 Done.");
  } catch (err) {
    console.error("❌ Error:", err.message || err);
    process.exit(1);
  }
}

main();
