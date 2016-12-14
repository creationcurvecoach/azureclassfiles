Function Create-Storage ($fName, $fLocation)
# Set the current storage account

{

    # Get the default subscription name
    $subname = ""
    foreach ($sub in Get-AzureSubscription) {
        if ($sub.IsDefault -eq "True")
        {
            $subname = $sub.SubscriptionName
        }
    }

    Write-Host "Storage is:" $fName
    Write-Host "Location is:" $fLocation

    New-AzureStorageAccount -StorageAccountName $fName -Location $fLocation
    Set-AzureSubscription -SubscriptionName $subname -CurrentStorageAccountName $fName

}