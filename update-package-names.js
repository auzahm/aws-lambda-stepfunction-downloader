// update-package-names.js
// Usage: node update-package-names.js [--skip-install]

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const mainFiles = ["index.js"];
const skipInstall = process.argv.includes("--skip-install");

// Mapping config keys to .env variables
const envMapping = {
  MY_ACCESS_KEY: "MY_ACCESS_KEY",
  MY_SECRET_ACCESS_KEY: "MY_SECRET_ACCESS_KEY",
  MY_REGION: "MY_REGION",
  database: "database",
  db_user: "db_user",
  db_pass: "db_pass",
  db_server: "db_server",
  db_type: "db_type",
  db_port: "db_port",
  db_max: "db_max",
  db_min: "db_min",
  db_idle: "db_idle",
  db_acquire: "db_acquire",
  secret: "secret",
  serverurl: "serverurl",
};

const defaultEnv = `# Environment variables
MY_ACCESS_KEY=youraccesskey
MY_SECRET_ACCESS_KEY=yoursecretaccesskey
MY_REGION=yourregion
db_port=yourport
secret=yoursecret
database=yourdatabase
db_user=youruser
db_pass=yourpass
db_server=yourserverendpoint
db_type=yourdbtype
serverurl=yourserverurl
db_max=10
db_min=0
db_idle=100000
db_acquire=100000
`;

const gitignoreContent = `.env
node_modules
npm-debug.log
`;

const folders = fs
  .readdirSync(rootDir)
  .filter((file) => fs.statSync(path.join(rootDir, file)).isDirectory());

folders.forEach((folder) => {
  const folderPath = path.join(rootDir, folder);
  const packagePath = path.join(folderPath, "package.json");
  const envPath = path.join(folderPath, ".env");
  const gitignorePath = path.join(folderPath, ".gitignore");

  // --- Update package.json ---
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      pkg.name = folder.toLowerCase().replace(/\s+/g, "-");
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
      console.log(`📦 Updated package.json in ${folder}`);
    } catch (err) {
      console.error(`❌ Failed to update ${packagePath}:`, err.message);
    }
  }

  // --- Overwrite .env ---
  fs.writeFileSync(envPath, defaultEnv);
  console.log(`📝 Created/Updated .env in ${folder}`);

  // --- Overwrite .gitignore ---
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(`🛡️  Created/Updated .gitignore in ${folder}`);

  // --- Install dotenv ---
  if (!skipInstall) {
    try {
      console.log(`📦 Installing dotenv in ${folder}...`);
      execSync("npm install dotenv", { cwd: folderPath, stdio: "inherit" });
      console.log(`✅ Installed dotenv in ${folder}`);
    } catch (err) {
      console.error(`❌ Failed to install dotenv in ${folder}:`, err.message);
    }
  } else {
    console.log(`⏭️ Skipped npm install in ${folder}`);
  }

  // --- Process main Lambda file ---
  for (const fileName of mainFiles) {
    const filePath = path.join(folderPath, fileName);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");

      // Add dotenv require if missing
      if (!content.includes("require('dotenv').config()") && !content.includes("dotenv/config")) {
        content = "require('dotenv').config();\n" + content;
        console.log(`✅ Added dotenv require in ${fileName} of ${folder}`);
      }

      // Replace config.X with process.env
      Object.keys(envMapping).forEach((key) => {
        const envVar = envMapping[key];
        const regex = new RegExp(`config\\.${key}`, "g");
        content = content.replace(regex, `process.env.${envVar}`);
      });

      // Replace hardcoded region
      content = content.replace(
        /region\s*:\s*["'][a-z0-9-]+["']/g,
        "region: process.env.AWS_REGION"
      );

      fs.writeFileSync(filePath, content);
      console.log(`🔧 Updated Lambda code in ${fileName} of ${folder}`);
      break; // stop after first found main file
    }
  }
});

console.log("\n🎉 All done! Packages, envs, and code updated.");
