#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const secretPatterns = [
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "AWS Secret Key", pattern: /[0-9a-zA-Z/+]{40}/ },
  { name: "Stripe Secret Key", pattern: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: "Stripe Test Key", pattern: /sk_test_[0-9a-zA-Z]{24}/ },
  { name: "JWT Token", pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/ },
  { name: "Google API Key", pattern: /AIza[0-9A-Za-z-_]{35}/ },
  { name: "GitHub Token", pattern: /ghp_[0-9a-zA-Z]{36}/ },
  { name: "Private Key", pattern: /-----BEGIN PRIVATE KEY-----/ },
  { name: "Database URL", pattern: /postgres:\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+/ },
]

function scanDirectory(dir, excludeDirs = [".git", "node_modules", ".next", "dist"]) {
  const results = []

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      lines.forEach((line, lineNumber) => {
        secretPatterns.forEach(({ name, pattern }) => {
          if (pattern.test(line)) {
            results.push({
              file: filePath,
              line: lineNumber + 1,
              type: name,
              content: line.trim().substring(0, 100) + "...",
            })
          }
        })
      })
    } catch (error) {
      // Skip files that can't be read
    }
  }

  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          walkDir(fullPath)
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if ([".js", ".ts", ".tsx", ".jsx", ".json", ".env", ".md", ".txt"].includes(ext)) {
          scanFile(fullPath)
        }
      }
    }
  }

  walkDir(dir)
  return results
}

function runSecurityScan() {
  console.log("🔒 Scanning for exposed secrets and sensitive data...\n")

  const results = scanDirectory(process.cwd())

  if (results.length === 0) {
    console.log("✅ No exposed secrets detected!")
    console.log("🛡️  Your codebase appears secure.")
    return
  }

  console.log(`❌ Found ${results.length} potential security issues:\n`)

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.type}`)
    console.log(`   File: ${result.file}`)
    console.log(`   Line: ${result.line}`)
    console.log(`   Content: ${result.content}`)
    console.log("")
  })

  console.log("🚨 SECURITY ALERT: Exposed secrets detected!")
  console.log("📋 Action items:")
  console.log("   1. Remove secrets from code immediately")
  console.log("   2. Add sensitive files to .gitignore")
  console.log("   3. Use environment variables instead")
  console.log("   4. Rotate any exposed credentials")
  console.log("   5. Review git history for leaked secrets")

  process.exit(1)
}

runSecurityScan()
