$root = Join-Path $PSScriptRoot "src"
$pairs = @(
  @("from-teal-400 to-teal-600", "from-neon-pink to-neon-mint"),
  @("hover:from-teal-300 hover:to-teal-500", "hover:brightness-110"),
  @("from-amber-400 to-amber-600", "from-neon-pink to-neon-mint"),
  @("hover:from-amber-300 hover:to-amber-500", "hover:brightness-110"),
  @("shadow-teal-900/30", "shadow-neon-pink/40"),
  @("amber-950", "eggplant-950"),
  @("amber-900", "eggplant-900"),
  @("amber-800", "neon-pink"),
  @("amber-700", "neon-pink"),
  @("amber-600", "neon-mint"),
  @("amber-500", "neon-mint"),
  @("amber-400", "neon-mint"),
  @("amber-300", "neon-mint-200"),
  @("amber-200", "neon-mint-100"),
  @("amber-100", "neon-mint-100"),
  @("amber-50", "neon-mint-100"),
  @("teal-950", "eggplant-950"),
  @("teal-900", "eggplant-900"),
  @("teal-800", "eggplant-800"),
  @("teal-700", "neon-pink"),
  @("teal-600", "neon-mint"),
  @("teal-500", "neon-mint"),
  @("teal-400", "neon-mint"),
  @("teal-300", "neon-mint-200"),
  @("teal-200", "neon-mint-100"),
  @("teal-100", "neon-mint-100"),
  @("teal-50", "neon-mint-100"),
  @("slate-950", "eggplant-950"),
  @("slate-900", "eggplant-900"),
  @("slate-800", "eggplant-900"),
  @("slate-700", "eggplant-800"),
  @("slate-600", "eggplant-700"),
  @("slate-500", "vice-muted"),
  @("slate-400", "vice-muted"),
  @("slate-300", "vice-border"),
  @("slate-200", "vice-border"),
  @("slate-100", "neon-mint-100"),
  @("slate-50", "vice-surface"),
  @("stone-950", "eggplant-950"),
  @("stone-900", "eggplant-900"),
  @("stone-800", "eggplant-900"),
  @("stone-700", "eggplant-800"),
  @("stone-600", "eggplant-700"),
  @("stone-500", "vice-muted"),
  @("stone-400", "vice-muted"),
  @("stone-300", "vice-border"),
  @("stone-200", "vice-border"),
  @("stone-100", "neon-mint-100"),
  @("stone-50", "vice-surface"),
  @("ring-teal-500/40", "ring-neon-mint/40"),
  @("ring-teal-500", "ring-neon-mint"),
  @("border-teal-500", "border-neon-mint"),
  @("border-teal-600", "border-neon-mint"),
  @("border-teal-200", "border-neon-mint/30"),
  @("border-amber-600", "border-neon-pink"),
  @("border-amber-200", "border-neon-pink/30"),
  @("border-amber-300", "border-neon-pink/40"),
  @("bg-amber-50", "bg-neon-pink/10"),
  @("bg-amber-100", "bg-neon-mint/15"),
  @("text-teal-800", "text-eggplant-900"),
  @("hover:text-amber-800", "hover:text-neon-mint"),
  @("hover:text-teal-800", "hover:text-neon-mint"),
  @("hover:border-amber-300", "hover:border-neon-pink"),
  @("text-slate-900", "text-eggplant-950")
)
$n = 0
Get-ChildItem -Path $root -Recurse -Include *.tsx,*.ts | ForEach-Object {
  $c = [IO.File]::ReadAllText($_.FullName)
  $o = $c
  foreach ($p in $pairs) { $c = $c.Replace($p[0], $p[1]) }
  if ($c -ne $o) {
    [IO.File]::WriteAllText($_.FullName, $c)
    $n++
  }
}
Write-Host "Wynwood: updated $n files"
