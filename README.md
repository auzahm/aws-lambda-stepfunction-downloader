# AWS Lambda & Step Functions Downloader 🚀

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![AWS](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazonaws)
![StepFunctions](https://img.shields.io/badge/AWS-Step_Functions-blue?logo=amazonaws)
![License](https://img.shields.io/badge/License-MIT-yellow)

This repository provides utilities to **download AWS Lambda function code** from both **Step Functions state machines** and **individual Lambda ARNs**.  
It also includes scripts to standardize package names, environment files, and prepare functions for local development.

## 📂 Project Structure

aws-lambda-stepfunction-downloader/
├── node_modules/
├── .gitignore
├── download-stepfn-lambda.js # Download Lambdas from Step Functions
├── downloadLambda.js # Download a single Lambda
├── package-lock.json
├── package.json
├── README.md
├── update-package-names.js # Update package.json, .env, and .gitignore in each Lambda
└── .env.example # Example environment variables

## ⚙️ Setup

1. **Clone this repo**
git clone https://github.com/yourusername/aws-lambda-stepfunction-downloader.git
cd aws-lambda-stepfunction-downloader

2. **Install dependencies**
npm install

3. **Configure AWS credentials (one-time)**

On Windows (PowerShell):
$env:AWS_ACCESS_KEY_ID="youraccesskey"
$env:AWS_SECRET_ACCESS_KEY="yoursecretaccesskey"
$env:AWS_REGION="your-region"

On Linux/Mac:
export AWS_ACCESS_KEY_ID="youraccesskey"
export AWS_SECRET_ACCESS_KEY="yoursecretaccesskey"
export AWS_REGION="your-region"

4. **Setup .env files for Lambdas**
cp .env.example .env

## 📥 Download Lambdas from Step Function

node download-stepfn-lambda.js <stepFunctionArn>

**Example:**
node download-stepfn-lambda.js arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine

This will:
- Fetch the state machine definition
- Extract Lambda ARNs
- Download their ZIPs
- Extract source code into `lambda-mods/<functionName>/`

## 📥 Download a Single Lambda

node downloadLambda.js <lambdaArn>

**Example:**
node downloadLambda.js arn:aws:lambda:us-east-1:123456789012:function:MyLambda

## 🛠️ Update Package Names & Environment Files

Run this to standardize `package.json`, generate `.env`, update `.gitignore`, and install dotenv:

node update-package-names.js

It will:
- Rename `package.json` `name` field → folder name  
- Create `.env` and `.gitignore`  
- Inject `dotenv` into code  
- Replace `config.*` with `process.env.*`  

## 📝 Environment Variables

Each Lambda should have a `.env` file. Start by copying the example:

cp .env.example .env

**Example `.env.example`:**
AWS Credentials
MY_ACCESS_KEY=youraccesskey
MY_SECRET_ACCESS_KEY=yoursecretaccesskey
MY_REGION=us-east-1

Database Settings
database=yourdatabase
db_user=youruser
db_pass=yourpass
db_server=yourserverendpoint
db_type=yourdbtype
db_port=yourport
db_max=10
db_min=0
db_idle=100000
db_acquire=100000

App Settings
secret=yoursecret
serverurl=yourserverurl

## ✅ Example Workflow

1. Download Step Function Lambdas:
node download-stepfn-lambda.js arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine

2. Navigate into:
lambda-mods/<functionName>/

3. Update `.env` file with correct values  

4. Run/update code locally  

## 📌 Notes

- Works with both ZIP-based Lambdas and Step Functions  
- Skips container image Lambdas (prints a note)  
- Great for auditing, debugging, and migrating Lambda code  
- Do **not** commit `.env` files (already in `.gitignore`)  

## 👨‍💻 Author

Developed by **Auzah Mansoor** ✨  
Feel free to open issues or PRs to improve this project.
