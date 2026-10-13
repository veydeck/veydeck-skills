#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(repositoryRoot, 'shared/brand/veydeck-brand.md')
const skillNames = ['veydeck-app-icon', 'veydeck-icon-system', 'veydeck-ui-style']
const targetPaths = skillNames.map((skillName) =>
  path.join(repositoryRoot, 'skills', skillName, 'references', 'veydeck-brand.md'),
)

/** 输出脚本用法并以指定状态结束。 */
function exitWithUsage(exitCode) {
  console.error('用法：node scripts/sync-shared-references.mjs --check|--write')
  process.exit(exitCode)
}

/** 检查 Skill 入口未引用包边界之外的相对路径。 */
async function checkSkillBoundaries() {
  const invalidSkills = []

  for (const skillName of skillNames) {
    const skillPath = path.join(repositoryRoot, 'skills', skillName, 'SKILL.md')
    const skillContent = await readFile(skillPath, 'utf8')

    if (skillContent.includes('../')) {
      invalidSkills.push(path.relative(repositoryRoot, skillPath))
    }
  }

  return invalidSkills
}

/** 校验各 Skill 内置副本与共享维护源完全一致。 */
async function checkReferences(sourceContent) {
  const mismatchedPaths = []

  for (const targetPath of targetPaths) {
    let targetContent

    try {
      targetContent = await readFile(targetPath, 'utf8')
    } catch {
      mismatchedPaths.push(path.relative(repositoryRoot, targetPath))
      continue
    }

    if (targetContent !== sourceContent) {
      mismatchedPaths.push(path.relative(repositoryRoot, targetPath))
    }
  }

  return mismatchedPaths
}

/** 将共享维护源写入每个 Skill 的自包含参考目录。 */
async function writeReferences(sourceContent) {
  await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, sourceContent, 'utf8')))
}

const [mode, ...extraArguments] = process.argv.slice(2)
if (!['--check', '--write'].includes(mode) || extraArguments.length > 0) {
  exitWithUsage(2)
}

const sourceContent = await readFile(sourcePath, 'utf8')

if (mode === '--write') {
  await writeReferences(sourceContent)
  console.log(`已同步 ${targetPaths.length} 个 Skill 的品牌参考。`)
  process.exit(0)
}

const [mismatchedPaths, invalidSkills] = await Promise.all([
  checkReferences(sourceContent),
  checkSkillBoundaries(),
])

if (mismatchedPaths.length > 0 || invalidSkills.length > 0) {
  if (mismatchedPaths.length > 0) {
    console.error(`品牌参考未同步：\n- ${mismatchedPaths.join('\n- ')}`)
  }
  if (invalidSkills.length > 0) {
    console.error(`Skill 引用了包边界之外的路径：\n- ${invalidSkills.join('\n- ')}`)
  }
  process.exit(1)
}

console.log('共享参考一致，Skill 引用未越出包边界。')
