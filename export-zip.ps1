# Export Project to ZIP (Exclude gitignored files)
# Usage: .\export-zip.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  EXPORT PROJECT TO ZIP" -ForegroundColor Cyan
Write-Host "  (Exclude gitignored files)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_NAME = "ShootingCenter"
$TIMESTAMP = Get-Date -Format "ddMMyyyy_HHmmss"
$ZIP_NAME = "$PROJECT_NAME`_$TIMESTAMP.zip"

Write-Host "[INFO] Dang tao file ZIP: $ZIP_NAME" -ForegroundColor Yellow
Write-Host ""

# Read .gitignore patterns
$excludePatterns = @()
if (Test-Path ".gitignore") {
    $excludePatterns = Get-Content ".gitignore" | Where-Object { 
        $_ -and $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' 
    } | ForEach-Object { 
        $pattern = $_.Trim()
        # Simple matching patterns
        $pattern
    }
}

# Add default excludes
$excludePatterns += @('.git', 'node_modules', '.vscode', '.idea', 'dist', 'dist-ssr', 'logs')

# Function to check if path should be excluded
function Should-Exclude($path) {
    $normalizedPath = $path -replace '\\', '/'
    foreach ($pattern in $excludePatterns) {
        $pattern = $pattern -replace '\\', '/'
        # Check if path contains the pattern
        if ($normalizedPath -like "*/$pattern*" -or 
            $normalizedPath -like "*$pattern*" -or
            $normalizedPath -match [regex]::Escape($pattern)) {
            return $true
        }
    }
    # Check file extensions/patterns
    if ($path -match '\.log$' -or 
        $path -match '\.local$' -or 
        $path -match '\.suo$' -or 
        $path -match '\.DS_Store$' -or
        $path -match '\.sw.$') {
        return $true
    }
    return $false
}

# Get all files to zip (relative paths only to avoid duplicates)
$basePath = (Get-Location).Path
$allFiles = @()

Get-ChildItem -Recurse -File | ForEach-Object {
    $fullPath = $_.FullName
    if (-not (Should-Exclude $fullPath)) {
        $allFiles += $_
    }
}

# Remove any potential duplicates
$filesToZip = $allFiles | Sort-Object FullName -Unique

Write-Host "[INFO] Tim thay $($filesToZip.Count) files de nen" -ForegroundColor Yellow
Write-Host ""

if ($filesToZip.Count -eq 0) {
    Write-Host "[ERROR] Khong tim thay file nao!" -ForegroundColor Red
    pause
    exit 1
}

# Create zip using .NET (more reliable)
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null
    
    $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
    
    # Remove existing zip if any
    if (Test-Path $ZIP_NAME) {
        Remove-Item $ZIP_NAME -Force
    }
    
    # Create temp folder and copy files
    $tempFolder = Join-Path $env:TEMP ("ZipExport_" + [Guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Path $tempFolder | Out-Null
    
    $fileCount = 0
    foreach ($file in $filesToZip) {
        $relativePath = $file.FullName.Substring($basePath.Length + 1)
        $destPath = Join-Path $tempFolder $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item $file.FullName -Destination $destPath -Force
        $fileCount++
        
        if ($fileCount % 50 -eq 0) {
            Write-Host "  Da copy $fileCount/$($filesToZip.Count) files..." -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "[INFO] Dang nen files..." -ForegroundColor Yellow
    
    # Create zip from temp folder
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $ZIP_NAME, $compressionLevel, $false)
    
    # Clean up temp folder
    Remove-Item -Path $tempFolder -Recurse -Force
    
    if (Test-Path $ZIP_NAME) {
        $fullPath = Resolve-Path $ZIP_NAME
        $size = (Get-Item $ZIP_NAME).Length / 1MB
        Write-Host ""
        Write-Host "[SUCCESS] Da tao file ZIP thanh cong!" -ForegroundColor Green
        Write-Host "[INFO] File: $fullPath" -ForegroundColor Cyan
        Write-Host "[INFO] Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
        Write-Host "[INFO] So files: $fileCount" -ForegroundColor Cyan
    } else {
        throw "File ZIP khong duoc tao"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Tao file ZIP that bai: $_" -ForegroundColor Red
    # Clean up temp folder if exists
    if (Test-Path $tempFolder) {
        Remove-Item -Path $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
    pause
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HOAN TAT!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
pause
