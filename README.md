# AWS Lambda & Step Functions Downloader 🚀

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![AWS](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazonaws)
![StepFunctions](https://img.shields.io/badge/AWS-Step_Functions-blue?logo=amazonaws)
![License](https://img.shields.io/badge/License-MIT-yellow)

This repository helps you:

- Download AWS Lambda functions (ZIP-based) from your account  
- Extract Lambdas referenced in Step Function state machine definitions  
- Standardize `.env`, `package.json`, and `.gitignore` for easier local development

## ⚙️ Setup

1. **Clone this repo**
   git clone https://github.com/yourusername/aws-lambda-stepfunction-downloader.git
   cd aws-lambda-stepfunction-downloader

2. **Install dependencies**
   npm install

3. **Configure AWS credentials (one-time)**

   **On Windows (PowerShell):**

   $env:AWS_ACCESS_KEY_ID="youraccesskey"
   $env:AWS_SECRET_ACCESS_KEY="yoursecretaccesskey"
   $env:AWS_REGION="your-region"

   **On Linux/Mac:**
   
   export AWS_ACCESS_KEY_ID="youraccesskey"
   export AWS_SECRET_ACCESS_KEY="yoursecretaccesskey"
   export AWS_REGION="your-region"

4. **Setup .env files for Lambdas**
   cp .env.example .env

## 🚀 Usage Examples

1. **Download Lambdas from Step Function**
    node download-stepfn-lambda.js <stepFunctionArn>

    **Example:**
    node download-stepfn-lambda.js arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine

    This will:

        - Fetch the state machine definition
        - Extract Lambda ARNs
        - Download their ZIPs   
        - Extract source code into `lambda-mods/<functionName>/`

2. **Download a Single Lambda (or all Lambdas in region)**
    node downloadLambda.js <FunctionNameOrRegion> [outputDir]

    **Example:**
    node downloadLambda.js arn:aws:lambda:us-east-1:123456789012:function:MyLambda
    node downloadLambda.js us-east-1 ./lambdas

3. **Standardize Environment & Package Files**
    node update-package-names.js

    This will:

        - Rename `package.json` `name` field to match folder name  
        - Generate `.env` and `.gitignore` inside each Lambda folder  
        - Add `dotenv` into code if missing
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

## 🌟 Example Workflow

1. Set your AWS environment variables
2. Run node download-stepfn-lambda.js <YourStepFunctionArn>
3. Look for extracted lambdas inside lambda-mods/
4. Copy .env.example to .env inside those folders
5. Use update-package-names.js if needed
6. Inspect code locally or version-control it

## ⚠️ Notes & Limitations

- This tool only works with ZIP-based Lambdas, not container image Lambdas 
- Some Lambdas’ code may be built/deployed; output may not exactly match source
- Great for auditing, debugging, and migrating Lambda code  
- Do **not** commit `.env` files (already in `.gitignore`)  

## 👨‍💻 Author

Developed by **Auzah Mansoor** ✨  
Feedback and contributions are welcome!
