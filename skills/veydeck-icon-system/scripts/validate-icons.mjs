#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const targetDirs =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [
        'packages/icons/src/svgs/common',
        'packages/icons/src/svgs/apps',
      ]
const fileNamePattern = /^[a-z0-9-]+\.svg$/
const forbiddenPatterns = [
  /<text[\s>]/i,
  /<image[\s>]/i,
  /base64/i,
  /[\u{1F000}-\u{1FAFF}]/u,
]

const errors = []
let validatedCount = 0

for (const targetDir of targetDirs) {
  if (!existsSync(targetDir)) {
    errors.push(`${targetDir}: directory does not exist`)
    continue
  }
  if (!statSync(targetDir).isDirectory()) {
    errors.push(`${targetDir}: target is not a directory`)
    continue
  }
  const files = readdirSync(targetDir)
    .filter((file) => file.endsWith('.svg'))
    .sort()

  if (files.length === 0) {
    errors.push(`${targetDir}: no SVG icons found`)
    continue
  }

  for (const file of files) {
    const path = join(targetDir, file)
    if (!statSync(path).isFile()) continue
    const source = readFileSync(path, 'utf8')
    validatedCount += 1

    if (!fileNamePattern.test(file)) {
      errors.push(`${file}: file name must use lowercase letters, digits, and hyphens`)
    }
    if (!/viewBox="0 0 24 24"/.test(source)) {
      errors.push(`${file}: missing viewBox="0 0 24 24"`)
    }
    if (!/stroke="currentColor"/.test(source)) {
      errors.push(`${file}: missing stroke="currentColor"`)
    }
    if (/stroke-width="(?!2")/.test(source)) {
      errors.push(`${file}: stroke-width must be 2 unless there is a documented reason`)
    }
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(source)) {
        errors.push(`${file}: contains forbidden SVG content`)
        break
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${validatedCount} Veydeck SVG icons`)
