$css = Get-Content -Raw "e:\AI\apk\PromoterApp\style.css" -Encoding UTF8
$js = Get-Content -Raw "e:\AI\apk\PromoterApp\js\app.js" -Encoding UTF8
$html = Get-Content -Raw "e:\AI\apk\PromoterApp\index_template.html" -Encoding UTF8

$html = $html.Replace("/* CSS_PLACEHOLDER */", $css)
$html = $html.Replace("// JS_PLACEHOLDER", $js)

Set-Content -Path "e:\AI\apk\PromoterApp\index.html" -Value $html -Encoding UTF8
Write-Host "Build complete! index.html generated successfully."
