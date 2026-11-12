# 生成 4Link 的应用图标、Android 自适应图标与启动图。
# 用法：powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root 'build'
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

$paper = [System.Drawing.Color]::FromArgb(255, 242, 236, 221)
$ink = [System.Drawing.Color]::FromArgb(255, 43, 42, 38)
$grid = [System.Drawing.Color]::FromArgb(90, 43, 42, 38)
$red = [System.Drawing.Color]::FromArgb(255, 190, 64, 54)
$blue = [System.Drawing.Color]::FromArgb(255, 47, 74, 107)

function New-RoundedPath([double]$x, [double]$y, [double]$w, [double]$h, [double]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Stone($g, [double]$cx, [double]$cy, [double]$radius, $color) {
  $shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 0, 0, 0))
  $g.FillEllipse($shadow, [float]($cx - $radius + $radius * 0.08), [float]($cy - $radius + $radius * 0.16), [float]($radius * 2), [float]($radius * 2))
  $fill = New-Object System.Drawing.SolidBrush($color)
  $g.FillEllipse($fill, [float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2), [float]($radius * 2))
  $rim = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(55, 0, 0, 0), [float]($radius * 0.16))
  $g.DrawEllipse($rim, [float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2), [float]($radius * 2))
  $shine = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(105, 255, 255, 255))
  $g.FillEllipse($shine, [float]($cx - $radius * 0.48), [float]($cy - $radius * 0.58), [float]($radius * 0.62), [float]($radius * 0.4))
}

function Draw-Logo($g, [double]$cx, [double]$cy, [double]$span, [double]$lineWidth) {
  $step = $span / 5
  $left = $cx - $span / 2
  $top = $cy - $span / 2
  $pen = New-Object System.Drawing.Pen($grid, [float]$lineWidth)
  for ($i = 0; $i -lt 6; $i++) {
    $x = $left + $i * $step
    $y = $top + $i * $step
    $g.DrawLine($pen, [float]$x, [float]$top, [float]$x, [float]($top + $span))
    $g.DrawLine($pen, [float]$left, [float]$y, [float]($left + $span), [float]$y)
  }
  $border = New-Object System.Drawing.Pen($ink, [float]($lineWidth * 2.1))
  $g.DrawRectangle($border, [float]$left, [float]$top, [float]$span, [float]$span)

  $radius = $span * 0.089
  $stones = @(
    @(0, 4, $red),
    @(1, 3, $red),
    @(2, 2, $red),
    @(3, 1, $red),
    @(4, 4, $blue)
  )
  foreach ($stone in $stones) {
    Draw-Stone $g ($left + $stone[0] * $step) ($top + $stone[1] * $step) $radius $stone[2]
  }
}

function New-IconBitmap([int]$size, [bool]$opaque) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $s = $size / 512.0
  if ($opaque) {
    $card = New-RoundedPath (2 * $s) (2 * $s) ($size - 4 * $s) ($size - 4 * $s) (88 * $s)
    $paperBrush = New-Object System.Drawing.SolidBrush($paper)
    $g.FillPath($paperBrush, $card)
    $edge = New-Object System.Drawing.Pen($ink, [float](12 * $s))
    $g.DrawPath($edge, (New-RoundedPath (18 * $s) (18 * $s) ($size - 36 * $s) ($size - 36 * $s) (72 * $s)))
    Draw-Logo $g ($size / 2) ($size / 2) (304 * $s) (5 * $s)
  } else {
    Draw-Logo $g ($size / 2) ($size / 2) ($size * 0.62) ($size * 0.011)
  }

  $g.Dispose()
  return $bmp
}

function Save-Png($bitmap, [string]$path) {
  $dir = Split-Path -Parent $path
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# 桌面应用与安装包图标
$icon = New-IconBitmap 512 $true
Save-Png $icon (Join-Path $buildDir 'icon.png')
$icon.Dispose()

$androidRes = Join-Path $root 'android/app/src/main/res'
if (Test-Path $androidRes) {
  $legacy = @{ 'mdpi' = 48; 'hdpi' = 72; 'xhdpi' = 96; 'xxhdpi' = 144; 'xxxhdpi' = 192 }
  $foreground = @{ 'mdpi' = 108; 'hdpi' = 162; 'xhdpi' = 216; 'xxhdpi' = 324; 'xxxhdpi' = 432 }

  foreach ($name in $legacy.Keys) {
    $size = $legacy[$name]
    $bmp = New-IconBitmap $size $true
    Save-Png $bmp (Join-Path $androidRes "mipmap-$name/ic_launcher.png")
    Save-Png $bmp (Join-Path $androidRes "mipmap-$name/ic_launcher_round.png")
    $bmp.Dispose()
  }

  foreach ($name in $foreground.Keys) {
    $size = $foreground[$name]
    $bmp = New-IconBitmap $size $false
    Save-Png $bmp (Join-Path $androidRes "mipmap-$name/ic_launcher_foreground.png")
    $bmp.Dispose()
  }

  $splashes = @(
    @('drawable/splash.png', 480, 320),
    @('drawable-land-mdpi/splash.png', 480, 320),
    @('drawable-land-hdpi/splash.png', 800, 480),
    @('drawable-land-xhdpi/splash.png', 1280, 720),
    @('drawable-land-xxhdpi/splash.png', 1600, 960),
    @('drawable-land-xxxhdpi/splash.png', 1920, 1280),
    @('drawable-port-mdpi/splash.png', 320, 480),
    @('drawable-port-hdpi/splash.png', 480, 800),
    @('drawable-port-xhdpi/splash.png', 720, 1280),
    @('drawable-port-xxhdpi/splash.png', 960, 1600),
    @('drawable-port-xxxhdpi/splash.png', 1280, 1920)
  )

  $mark = New-IconBitmap 512 $true
  foreach ($splash in $splashes) {
    $path = Join-Path $androidRes $splash[0]
    $w = [int]$splash[1]
    $h = [int]$splash[2]
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear($paper)
    $markSize = [int]([Math]::Min($w, $h) * 0.34)
    $g.DrawImage($mark, [int](($w - $markSize) / 2), [int](($h - $markSize) / 2), $markSize, $markSize)
    $g.Dispose()
    Save-Png $bmp $path
    $bmp.Dispose()
  }
  $mark.Dispose()
}

Write-Host "Icons written to $buildDir"
