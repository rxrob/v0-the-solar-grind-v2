#!/usr/bin/env node

import fs from "fs"
import path from "path"

// The HTML content for the maintenance page
const lockdownPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance Mode</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .status { 
            background: #ff6b6b; 
            padding: 10px 20px; 
            border-radius: 25px; 
            display: inline-block;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">🚨 EMERGENCY LOCKDOWN ACTIVE</div>
        <h1>System Under Maintenance</h1>
        <p>Our security team is currently addressing a critical issue.</p>
        <p>We'll be back online shortly. Thank you for your patience.</p>
        <p><small>Incident ID: ${Date.now()}</small></p>
    </div>
</body>
</html>
`

function emergencyLockdown() {
  const reason = process.env.LOCKDOWN_REASON || "Security incident detected"
  const user = process.env.USER || "System"

  console.log("🚨 INITIATING EMERGENCY LOCKDOWN")
  console.log(`📋 Reason: ${reason}`)
  console.log(`👤 Initiated by: ${user}`)
  console.log(`⏰ Time: ${new Date().toISOString()}`)

  // Create maintenance page
  const publicDir = path.join(process.cwd(), "public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(path.join(publicDir, "maintenance.html"), lockdownPage)

  // Create lockdown flag
  fs.writeFileSync(
    path.join(process.cwd(), ".lockdown"),
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        reason,
        user,
        status: "LOCKED",
      },
      null,
      2,
    ),
  )

  // Backup critical files
  const appDir = path.join(process.cwd(), "app")
  const backupDir = path.join(process.cwd(), ".lockdown-backup")

  if (fs.existsSync(appDir) && !fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
    console.log(`📦 Created backup directory at ${backupDir}`)
    try {
      const mainPagePath = path.join(appDir, "page.tsx")
      if (fs.existsSync(mainPagePath)) {
        fs.copyFileSync(mainPagePath, path.join(backupDir, "page.tsx.bak"))
        console.log(`📄 Backed up app/page.tsx`)
      }
      const layoutPath = path.join(appDir, "layout.tsx")
      if (fs.existsSync(layoutPath)) {
        fs.copyFileSync(layoutPath, path.join(backupDir, "layout.tsx.bak"))
        console.log(`📄 Backed up app/layout.tsx`)
      }
    } catch (error) {
      console.error("⚠️  Backup failed, continuing with lockdown...", error)
    }
  }

  console.log("\n✅ Emergency lockdown activated")
  console.log("📄 Maintenance page created at /public/maintenance.html")
  console.log("🔒 System is now in lockdown mode")
  console.log("\nTo restore service, run:")
  console.log("  npm run restore-from-lockdown")
}

emergencyLockdown()
