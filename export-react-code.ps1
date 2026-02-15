$root = "src"

$extensions = "*.tsx","*.ts","*.jsx","*.js","*.css","*.scss"

Write-Output "FOLDER STRUCTURE"
Write-Output "================"
tree $root /F

Write-Output ""
Write-Output "FILE CONTENTS"
Write-Output "============="
Write-Output ""

Get-ChildItem -Path $root -Recurse -Include $extensions | ForEach-Object {

    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")

    Write-Output "FILE: $relativePath"
    Write-Output "----------------------------"

    Get-Content $_.FullName

    Write-Output ""
    Write-Output ""
}
