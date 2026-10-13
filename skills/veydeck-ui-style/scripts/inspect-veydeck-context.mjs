#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PACKAGE_NAMES = [
  "@veydeck/tokens",
  "@veydeck/icons",
  "@veydeck/vue",
  "@veydeck/react",
];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".vue"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".nuxt",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "target",
]);
const LOCK_FILES = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];
const FALLBACK_REPOSITORY = "https://github.com/veydeck/veydeck-ui.git";

function usage() {
  return [
    "Usage: node inspect-veydeck-context.mjs [--root <project>] [--format markdown|json] [--veydeck-ui <path>]",
    "",
    "Inspect a consumer project without network access or file writes.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { root: process.cwd(), format: "markdown", veydeckUi: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (argument === "--root" || argument === "--format" || argument === "--veydeck-ui") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }
      index += 1;
      if (argument === "--root") options.root = value;
      if (argument === "--format") options.format = value;
      if (argument === "--veydeck-ui") options.veydeckUi = value;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!new Set(["json", "markdown"]).has(options.format)) {
    throw new Error("--format must be markdown or json");
  }
  return options;
}

function realpath(target) {
  return fs.realpathSync(path.resolve(target));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function findNearestPackageJson(root) {
  let current = root;
  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function dependencyMap(manifest) {
  return Object.assign(
    {},
    manifest?.peerDependencies,
    manifest?.optionalDependencies,
    manifest?.devDependencies,
    manifest?.dependencies,
  );
}

function findInstalledPackage(root, packageName) {
  let current = root;
  const packageSegments = packageName.split("/");
  while (true) {
    const candidate = path.join(current, "node_modules", ...packageSegments, "package.json");
    if (fs.existsSync(candidate)) return realpath(candidate);
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function exportedPath(manifest, key) {
  const value = manifest?.[key];
  return typeof value === "string" ? value : null;
}

function rootExport(manifest) {
  const value = manifest?.exports?.["."];
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.import || value.default || value.require || null;
  }
  return exportedPath(manifest, "module") || exportedPath(manifest, "main");
}

function resolvePublishedFile(packageJsonPath, relativePath) {
  if (!packageJsonPath || !relativePath) return null;
  const candidate = path.resolve(path.dirname(packageJsonPath), relativePath);
  return fs.existsSync(candidate) ? candidate : null;
}

function repositoryUrl(manifest) {
  const repository = manifest?.repository;
  if (typeof repository === "string") return repository;
  if (repository && typeof repository.url === "string") {
    return repository.url.replace(/^git\+/, "");
  }
  return null;
}

function inspectPackages(root, dependencies) {
  return PACKAGE_NAMES.map((name) => {
    const packageJson = findInstalledPackage(root, name);
    const manifest = packageJson ? readJson(packageJson) : null;
    const typeEntry = exportedPath(manifest, "types");
    const styleEntry = exportedPath(manifest, "style");
    const publicEntry = rootExport(manifest);
    return {
      name,
      declaredVersion: dependencies[name] || null,
      installedVersion: manifest?.version || null,
      packageJson,
      publicEntry: resolvePublishedFile(packageJson, publicEntry),
      typeDeclarations: resolvePublishedFile(packageJson, typeEntry),
      styleSheet: resolvePublishedFile(packageJson, styleEntry),
      repository: repositoryUrl(manifest),
    };
  });
}

function inspectLockFiles(root) {
  const evidence = [];
  let current = root;
  while (true) {
    for (const name of LOCK_FILES) {
      const file = path.join(current, name);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
      const content = fs.readFileSync(file, "utf8");
      const packages = PACKAGE_NAMES.filter((packageName) => content.includes(packageName));
      const frameworks = [];
      if (/(@veydeck\/vue|(^|[\s"'])vue([@:"'\s/]|$))/m.test(content)) frameworks.push("vue");
      if (/(@veydeck\/react|(^|[\s"'])react(-dom)?([@:"'\s/]|$))/m.test(content)) frameworks.push("react");
      evidence.push({ file, packages, frameworks });
    }
    if (evidence.length > 0) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return evidence;
}

function inspectSourceImports(root) {
  const evidence = [];
  const stack = [root];
  let inspectedFiles = 0;
  let matchedFiles = 0;
  while (stack.length > 0 && inspectedFiles < 5000) {
    const directory = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) stack.push(target);
        continue;
      }
      if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
      inspectedFiles += 1;
      let content;
      try {
        content = fs.readFileSync(target, "utf8");
      } catch {
        continue;
      }
      const matches = [];
      for (const packageName of ["@veydeck/vue", "@veydeck/react", "vue", "react"]) {
        if (content.includes(`\"${packageName}\"`) || content.includes(`'${packageName}'`)) {
          matches.push(packageName);
        }
      }
      if (matches.length > 0) {
        matchedFiles += 1;
        if (evidence.length < 24) evidence.push({ file: target, imports: matches });
      }
    }
  }
  return {
    files: evidence,
    inspectedFiles,
    matchedFiles,
    evidenceTruncated: matchedFiles > evidence.length,
    scanTruncated: inspectedFiles >= 5000,
  };
}

function isVeydeckUiRepository(candidate) {
  const manifest = readJson(path.join(candidate, "package.json"));
  return (
    manifest?.name === "veydeck-ui" &&
    fs.existsSync(path.join(candidate, "packages", "tokens")) &&
    fs.existsSync(path.join(candidate, "packages", "icons"))
  );
}

function sourceCandidates(root, explicitPath) {
  const candidates = [];
  if (explicitPath) candidates.push(path.resolve(explicitPath));
  let current = root;
  while (true) {
    candidates.push(current);
    candidates.push(path.join(current, "veydeck-ui"));
    candidates.push(path.join(current, "linked-repos", "veydeck-ui"));
    candidates.push(path.join(path.dirname(current), "veydeck-ui"));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return [...new Set(candidates)].filter((candidate) => {
    try {
      return fs.statSync(candidate).isDirectory() && isVeydeckUiRepository(candidate);
    } catch {
      return false;
    }
  });
}

function validSourceRepository(candidate) {
  try {
    return fs.statSync(candidate).isDirectory() && isVeydeckUiRepository(candidate);
  } catch {
    return false;
  }
}

function frameworkFromEvidence(dependencies, packages, lockEvidence, sourceEvidence) {
  const evidence = { vue: [], react: [] };
  if (dependencies.vue) evidence.vue.push("package.json:vue");
  if (dependencies["@veydeck/vue"]) evidence.vue.push("package.json:@veydeck/vue");
  if (dependencies.react || dependencies["react-dom"]) evidence.react.push("package.json:react");
  if (dependencies["@veydeck/react"]) evidence.react.push("package.json:@veydeck/react");
  if (packages.some((item) => item.name === "@veydeck/vue" && item.installedVersion)) {
    evidence.vue.push("installed:@veydeck/vue");
  }
  if (packages.some((item) => item.name === "@veydeck/react" && item.installedVersion)) {
    evidence.react.push("installed:@veydeck/react");
  }
  for (const lock of lockEvidence) {
    for (const framework of lock.frameworks) evidence[framework].push(`lock:${lock.file}`);
  }
  for (const source of sourceEvidence.files) {
    if (source.imports.some((name) => name === "vue" || name.endsWith("/vue"))) {
      evidence.vue.push(`import:${source.file}`);
    }
    if (source.imports.some((name) => name === "react" || name.endsWith("/react"))) {
      evidence.react.push(`import:${source.file}`);
    }
  }
  const hasVue = evidence.vue.length > 0;
  const hasReact = evidence.react.length > 0;
  const framework = hasVue && hasReact ? "mixed" : hasVue ? "vue" : hasReact ? "react" : "unknown";
  return { framework, evidence };
}

function inspect(options) {
  const root = realpath(options.root);
  const nearestManifestPath = findNearestPackageJson(root);
  const nearestManifest = nearestManifestPath ? readJson(nearestManifestPath) : null;
  const projectRoot = nearestManifestPath ? path.dirname(nearestManifestPath) : root;
  const dependencies = dependencyMap(nearestManifest);
  const lockEvidence = inspectLockFiles(projectRoot);
  const sourceEvidence = inspectSourceImports(projectRoot);
  const packages = inspectPackages(projectRoot, dependencies);
  const framework = frameworkFromEvidence(dependencies, packages, lockEvidence, sourceEvidence);
  const repositories = [
    ...new Set(sourceCandidates(projectRoot, options.veydeckUi).map(realpath)),
  ];
  const warnings = [];
  if (!nearestManifestPath) warnings.push("No package.json was found at or above the target root.");
  if (framework.framework === "unknown") warnings.push("No Vue or React evidence was found.");
  if (framework.framework === "mixed") warnings.push("Both Vue and React were detected; select the stack for the target file or package.");
  if (packages.every((item) => !item.declaredVersion && !item.installedVersion)) {
    warnings.push("No @veydeck UI package was declared or installed.");
  }
  if (options.veydeckUi && !validSourceRepository(path.resolve(options.veydeckUi))) {
    warnings.push(`The explicit veydeck-ui path is not a valid source repository: ${path.resolve(options.veydeckUi)}`);
  }
  for (const item of packages) {
    if (item.declaredVersion && !item.installedVersion) {
      warnings.push(`${item.name} is declared as ${item.declaredVersion} but its installed package could not be resolved.`);
    }
  }
  if (sourceEvidence.scanTruncated) warnings.push("Source import inspection stopped after 5000 files.");
  const officialRepository =
    packages.map((item) => item.repository).find(Boolean) || FALLBACK_REPOSITORY;
  return {
    schemaVersion: 1,
    targetRoot: root,
    projectRoot,
    packageManifest: nearestManifestPath,
    framework: framework.framework,
    evidence: {
      framework: framework.evidence,
      lockFiles: lockEvidence,
      sourceImports: sourceEvidence.files,
      inspectedSourceFiles: sourceEvidence.inspectedFiles,
      matchedSourceFiles: sourceEvidence.matchedFiles,
      sourceImportEvidenceTruncated: sourceEvidence.evidenceTruncated,
    },
    packages,
    sourceRepositories: repositories,
    officialRepository,
    authorityOrder: [
      "consumer-project",
      "installed-package-version",
      "local-veydeck-ui-source",
      "official-github-reference",
    ],
    warnings,
  };
}

function display(value) {
  return value || "—";
}

function markdown(result) {
  const lines = [
    "# Veydeck UI Context",
    "",
    `- Target root: \`${result.targetRoot}\``,
    `- Project root: \`${result.projectRoot}\``,
    `- Framework: **${result.framework}**`,
    `- Package manifest: ${result.packageManifest ? `\`${result.packageManifest}\`` : "—"}`,
    `- Official repository: ${result.officialRepository}`,
    "",
    "## Packages",
    "",
    "| Package | Declared | Installed | Types | Styles |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const item of result.packages) {
    lines.push(
      `| ${item.name} | ${display(item.declaredVersion)} | ${display(item.installedVersion)} | ${display(item.typeDeclarations)} | ${display(item.styleSheet)} |`,
    );
  }
  lines.push("", "## Local source repositories", "");
  if (result.sourceRepositories.length === 0) lines.push("- None detected (optional).");
  else result.sourceRepositories.forEach((repository) => lines.push(`- \`${repository}\``));
  lines.push("", "## Warnings", "");
  if (result.warnings.length === 0) lines.push("- None.");
  else result.warnings.forEach((warning) => lines.push(`- ${warning}`));
  return lines.join("\n");
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = inspect(options);
  console.log(options.format === "json" ? JSON.stringify(result, null, 2) : markdown(result));
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(usage());
  process.exitCode = 1;
}
