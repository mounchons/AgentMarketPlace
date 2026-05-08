<#
.SYNOPSIS
  Add or remove a suffix (e.g. "-dev") on a whole plugin: manifest name,
  folder, every skill, and all cross-references — reversibly.

.DESCRIPTION
  Use this when you want to develop a plugin side-by-side with the deployed
  version without name collisions, then promote it back to the production
  name when ready.

  What it changes (in order):
    1. Cross-references in every text file under plugins\<plugin>\
         "/skill-name"          -> "/skill-name-<suffix>"
         "name: skill-name"     (frontmatter) -> "name: skill-name-<suffix>"
         '"name": "plugin"'     (plugin.json) -> '"name": "plugin-<suffix>"'
    2. Skill folders                                rename
    3. Top-level plugin folder                      rename (unless -KeepPluginFolder)

.PARAMETER Plugin
  Current plugin folder name under plugins\.
  For add mode: the production name (e.g. "brain").
  For remove mode: the suffixed name (e.g. "brain-dev").

.PARAMETER Mode
  add    -> append "-<suffix>"  to plugin + every skill
  remove -> strip  "-<suffix>"  from plugin + every skill

.PARAMETER Suffix
  Suffix to add/remove without leading dash. Default: "dev".

.PARAMETER KeepPluginFolder
  Do not rename the top-level plugins\<plugin>\ folder (only manifest field).
  Useful if external scripts hard-code the folder path.

.PARAMETER DryRun
  Print what would change without touching the disk.

.EXAMPLE
  .\tools\rename-plugin-suffix.ps1 -Plugin brain -Mode add
  # plugins\brain  ->  plugins\brain-dev
  # /brain-search  ->  /brain-search-dev    (in 12 files)
  # plugin.json name: "brain" -> "brain-dev"

.EXAMPLE
  .\tools\rename-plugin-suffix.ps1 -Plugin brain-dev -Mode remove -DryRun
  # Preview the un-rename without applying.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $Plugin,
    [Parameter(Mandatory)] [ValidateSet('add','remove')] [string] $Mode,
    [string] $Suffix = 'dev',
    [switch] $KeepPluginFolder,
    [switch] $DryRun
)

$ErrorActionPreference = 'Stop'

# ---------- resolve paths ----------
$RepoRoot     = Split-Path $PSScriptRoot -Parent
$PluginDir    = Join-Path $RepoRoot      "plugins\$Plugin"
$ManifestPath = Join-Path $PluginDir     ".claude-plugin\plugin.json"
$SkillsDir    = Join-Path $PluginDir     "skills"
$CommandsDir  = Join-Path $PluginDir     "commands"

if (-not (Test-Path $ManifestPath)) {
    throw "Plugin manifest not found: $ManifestPath"
}
$hasSkills   = Test-Path $SkillsDir
$hasCommands = Test-Path $CommandsDir
if (-not ($hasSkills -or $hasCommands)) {
    throw "Plugin has neither 'skills\' nor 'commands\' directory under $PluginDir"
}

$dash = "-$Suffix"

# ---------- read current manifest name ----------
$manifestRaw = Get-Content $ManifestPath -Raw
if ($manifestRaw -notmatch '"name"\s*:\s*"([^"]+)"') {
    throw "Could not find ""name"" field in $ManifestPath"
}
$currentPluginName = $matches[1]

# ---------- build skill name + command name mapping (old -> new) ----------
# Both share the same cross-ref pattern (/name) and rename direction, so a
# single mapping table drives the regex pass. We track item KIND (skill or
# command) separately so the rename phase knows whether to rename a folder
# or a .md file.
$mapping = [ordered]@{}     # name (no -dev) -> new name
$kind    = @{}              # name -> 'skill' | 'command'

function Add-Mapping([string]$old, [string]$itemKind) {
    if ($Mode -eq 'add') {
        if ($old.EndsWith($dash)) { Write-Host "[skip $itemKind] $old already suffixed" -Fore DarkGray; return }
        $script:mapping[$old] = "$old$dash"
    } else {
        if (-not $old.EndsWith($dash)) { Write-Host "[skip $itemKind] $old has no suffix" -Fore DarkGray; return }
        $script:mapping[$old] = $old.Substring(0, $old.Length - $dash.Length)
    }
    $script:kind[$old] = $itemKind
}

if ($hasSkills) {
    foreach ($f in (Get-ChildItem $SkillsDir -Directory)) { Add-Mapping $f.Name 'skill' }
}
if ($hasCommands) {
    foreach ($f in (Get-ChildItem $CommandsDir -File -Filter '*.md')) {
        Add-Mapping $f.BaseName 'command'
    }
}

# Plugin name mapping
if ($Mode -eq 'add') {
    if ($currentPluginName.EndsWith($dash)) {
        Write-Host "[skip plugin] manifest name '$currentPluginName' already suffixed" -Fore DarkGray
        $newPluginName = $currentPluginName
    } else {
        $newPluginName = "$currentPluginName$dash"
    }
} else {
    if (-not $currentPluginName.EndsWith($dash)) {
        Write-Host "[skip plugin] manifest name '$currentPluginName' has no suffix" -Fore DarkGray
        $newPluginName = $currentPluginName
    } else {
        $newPluginName = $currentPluginName.Substring(0, $currentPluginName.Length - $dash.Length)
    }
}

if ($mapping.Count -eq 0 -and $newPluginName -eq $currentPluginName) {
    Write-Host "Nothing to do." -Fore Yellow
    return
}

# ---------- preview ----------
Write-Host ""
Write-Host "=== rename-plugin-suffix [$Mode] ===" -Fore Cyan
$skillCount   = @($mapping.Keys | Where-Object { $kind[$_] -eq 'skill' }).Count
$commandCount = @($mapping.Keys | Where-Object { $kind[$_] -eq 'command' }).Count
Write-Host "Plugin folder    : $Plugin"
Write-Host "Manifest name    : $currentPluginName -> $newPluginName"
Write-Host "Skills           : $skillCount"
Write-Host "Commands         : $commandCount"
foreach ($k in $mapping.Keys) {
    Write-Host ("  [{0,-7}] {1} -> {2}" -f $kind[$k], $k, $mapping[$k]) -Fore DarkGray
}
Write-Host ""

# ---------- 1. rewrite text files ----------
# Sort skill keys longest-first so prefixes (e.g. "brain") don't eat
# the head of longer names (e.g. "brain-search") that share the prefix.
$sortedKeys = $mapping.Keys | Sort-Object { -$_.Length }

$utf8NoBom  = [System.Text.UTF8Encoding]::new($false)
$textGlobs  = '*.md','*.json','*.sh','*.bat','*.ps1','*.yaml','*.yml','*.toml','*.txt'
$textFiles  = Get-ChildItem $PluginDir -Recurse -File -Include $textGlobs `
              | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\' }

$updatedFiles = 0
foreach ($file in $textFiles) {
    $content  = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # 1a. slash-command cross-refs:  /skill-name (not followed by - or word char)
    foreach ($oldName in $sortedKeys) {
        $newName = $mapping[$oldName]
        $pat = '/' + [regex]::Escape($oldName) + '(?![-\w])'
        $content = [regex]::Replace($content, $pat, "/$newName")
    }

    # 1b. frontmatter "name: skill-name" lines in SKILL.md
    foreach ($oldName in $sortedKeys) {
        $newName = $mapping[$oldName]
        $pat = '(?m)^(name:\s*)' + [regex]::Escape($oldName) + '(\s*)$'
        $content = [regex]::Replace($content, $pat, "`${1}$newName`${2}")
    }

    # 1c. plugin.json "name": "<plugin>"
    if ($file.FullName -ieq $ManifestPath -and $newPluginName -ne $currentPluginName) {
        $pat = '("name"\s*:\s*")' + [regex]::Escape($currentPluginName) + '(")'
        $content = [regex]::Replace($content, $pat, "`${1}$newPluginName`${2}")
    }

    if ($content -ne $original) {
        $updatedFiles++
        if ($DryRun) {
            Write-Host "[would edit]  $($file.FullName.Substring($RepoRoot.Length+1))" -Fore Yellow
        } else {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "[edit]        $($file.FullName.Substring($RepoRoot.Length+1))" -Fore Green
        }
    }
}
Write-Host ""
Write-Host "Files modified: $updatedFiles" -Fore Cyan

# ---------- 2. rename skill folders + command files ----------
foreach ($oldName in $sortedKeys) {
    $newName = $mapping[$oldName]
    if ($kind[$oldName] -eq 'skill') {
        $oldPath = Join-Path $SkillsDir $oldName
        $newPath = Join-Path $SkillsDir $newName
        if (Test-Path $newPath) { throw "Cannot rename: target already exists -> $newPath" }
        if ($DryRun) {
            Write-Host "[would rename]  skills\$oldName\ -> skills\$newName\" -Fore Yellow
        } else {
            Rename-Item -LiteralPath $oldPath -NewName $newName
            Write-Host "[rename]        skills\$oldName\ -> skills\$newName\" -Fore Green
        }
    } else {
        $oldFile = Join-Path $CommandsDir "$oldName.md"
        $newFile = Join-Path $CommandsDir "$newName.md"
        if (Test-Path $newFile) { throw "Cannot rename: target already exists -> $newFile" }
        if ($DryRun) {
            Write-Host "[would rename]  commands\$oldName.md -> commands\$newName.md" -Fore Yellow
        } else {
            Rename-Item -LiteralPath $oldFile -NewName "$newName.md"
            Write-Host "[rename]        commands\$oldName.md -> commands\$newName.md" -Fore Green
        }
    }
}

# ---------- 3. rename plugin folder (last — paths above no longer needed) ----------
if (-not $KeepPluginFolder -and $newPluginName -ne $currentPluginName) {
    $pluginsRoot = Join-Path $RepoRoot 'plugins'
    $newPluginPath = Join-Path $pluginsRoot $newPluginName
    if (Test-Path $newPluginPath) {
        throw "Cannot rename plugin folder: target already exists -> $newPluginPath"
    }
    if ($DryRun) {
        Write-Host "[would rename plugin folder] plugins\$Plugin -> plugins\$newPluginName" -Fore Yellow
    } else {
        Rename-Item -LiteralPath $PluginDir -NewName $newPluginName
        Write-Host "[rename plugin folder]       plugins\$Plugin -> plugins\$newPluginName" -Fore Green
    }
}

Write-Host ""
Write-Host "Done." -Fore Cyan
if ($DryRun) {
    Write-Host "(dry run — no files changed)" -Fore Yellow
} else {
    Write-Host "Next steps:"
    if ($Mode -eq 'add') {
        Write-Host "  1. Review the diff:  git diff --stat"
        Write-Host "  2. Install the dev plugin via marketplace, or use tools\dev-link.bat $newPluginName"
    } else {
        Write-Host "  1. Review the diff:  git diff --stat"
        Write-Host "  2. Re-run dev-link / publish as usual."
    }
}
