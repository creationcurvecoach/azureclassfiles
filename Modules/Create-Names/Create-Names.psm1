Function Create-Names ($labnum)
# Generate unique names for storage and cloud service:

{

    $uniqueNumber = (Get-Date).Ticks.ToString().Substring(12)
    $global:storeName = '20533lab' + "{0:00}" -f $labnum + 'store' + $uniqueNumber
    $global:svcName = '20533lab' + "{0:00}" -f $labnum + 'cloudsvc' + $uniqueNumber

    Write-Host "Azure storage name is:" $global:storeName -ForegroundColor Green

}