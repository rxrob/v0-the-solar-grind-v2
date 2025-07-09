#!/usr/bin/env node

import fs from "fs"
import path from "path"

function restoreFromLockdown() {
  console.log("🔧 INITIATING SERVICE RESTORATION")

  const lockdownFlag = path.join(process.cwd(), ".lockdown")
  const maintenancePage = path.join(process.cwd(), "public", "maintenance.html")
  const backupDir = path.join(process.cwd(), ".lockdown-backup")
  const appDir = path.join(process.cwd(), "app")

  // 1. Remove lockdown flag
  if (fs.existsSync(lockdownFlag)) {
    fs.unlinkSync(lockdownFlag)
    console.log("✅ Removed lockdown flag.")
  } else {
    console.log("ℹ️ No lockdown flag found.")
  }

  // 2. Remove maintenance page
  if (fs.existsSync(maintenancePage)) {
    fs.unlinkSync(maintenancePage)
    console.log("✅ Removed maintenance page.")
  } else {
    console.log("ℹ️ No maintenance page found.")
  }

  // 3. Restore from backup
  if (fs.existsSync(backupDir)) {
    console.log("📦 Found backup directory. Restoring files...")
    try {
      const backupPage = path.join(backupDir, "page.tsx.bak")
      if (fs.existsSync(backupPage)) {
        fs.copyFileSync(backupPage, path.join(appDir, "page.tsx"))
        console.log("📄 Restored app/page.tsx")
      }
      const backupLayout = path.join(backupDir, "layout.tsx.bak")
      if (fs.existsSync(backupLayout)) {
        fs.copyFileSync(backupLayout, path.join(appDir, "layout.tsx"))
        console.log("📄 Restored app/layout.tsx")
      }
      // Clean up backup directory
      fs.rmSync(backupDir, { recursive: true, force: true })
      console.log("✅ Cleaned up backup directory.")
    } catch (error) {
      console.error("⚠️  Restore from backup failed.", error)
      console.error("Please restore files manually from the .lockdown-backup directory.")
    }
  } else {
    console.log("ℹ️ No backup directory found.")
  }

  console.log("\n🎉 Service restoration complete!")
  console.log("🚀 System is back online.")
}

restoreFromLockdown()
