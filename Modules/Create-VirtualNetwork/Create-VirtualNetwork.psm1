Function Create-VirtualNetwork ($labnum)
# Create an IaaS v1 virtual network

{
    # Pick correct NetworkConfig.xml
    $netconfigpath = "D:\Configfiles\Lab" + "{0:00}" -f $labnum + "\NetworkConfig.xml"
    $sourcepath = "D:\Configfiles\Lab" + "{0:00}" -f $labnum + "\NetworkConfig.txt"

    # Replace generic "location" if required
    $searchword1 = "Location1"
    $replacement1 = $location
    (Get-Content $sourcepath) | % { $_ -replace $searchword1, $replacement1 } | Set-Content $netconfigpath

    # Search again, in case the lab needs 2 locations
    $searchword2 = "Location2"
    $replacement2 = $location2
    (Get-Content $netconfigpath) | % { $_ -replace $searchword2, $replacement2 } | Set-Content $netconfigpath

    Write-Host "Setting up virtual networks..."
    Set-AzureVNetConfig -ConfigurationPath $netconfigpath

}