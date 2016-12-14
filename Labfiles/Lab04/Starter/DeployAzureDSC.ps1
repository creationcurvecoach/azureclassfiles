Login-AzureRmAccount

Show-SubscriptionARM

$resourceGroupName = 'ResDevWebRG'
$location = 'west europe' # you need to change this parameter for your deployment

$storageAccount = (Get-AzureRmStorageAccount | Where-Object {($_.Location -eq $location) -and ($_.ResourceGroupName -eq $resourceGroupName) -and ($_.StorageAccountName -like $($resourceGroupName.ToLower() + "disks*"))})[0]
$storageAccountKey = (Get-AzureRmStorageAccountKey -ResourceGroupName $resourceGroupName -Name $storageAccount.StorageAccountName).Key1

# to account for changes described in https://msdn.microsoft.com/en-us/library/mt607145.aspx (per input from molenaar)
If (!($storageAccountKey)) {
$storageAccountKey = (Get-AzureRmStorageAccountKey -ResourceGroupName $resourceGroupName -Name $storageAccount.StorageAccountName).Value[0]
}

# we are using default container 
$containerName = 'windows-powershell-dsc'

$configurationName = 'IISInstall'
$configurationPath = ".\$configurationName.ps1"

$moduleURL = Publish-AzureRmVMDscConfiguration -ConfigurationPath $configurationPath -ResourceGroupName $resourceGroupName -StorageAccountName $storageAccount.StorageAccountName -Force

$storageContext = New-AzureStorageContext -StorageAccountName $storageAccount.StorageAccountName -StorageAccountKey $storageAccountKey
$sasToken = New-AzureStorageContainerSASToken -Name $containerName -Context $storageContext -Permission r

$settingsHashTable = @{
"ModulesUrl" = "$moduleURL";
"ConfigurationFunction" = "$configurationName.ps1\$configurationName";
"SasToken" = "$sasToken"
}

$vmName1= 'ResDevWebVM1'
$vmName2= 'ResDevWebVM2'
$extensionName = 'DSC'
$extensionType = 'DSC'
$publisher = 'Microsoft.Powershell'
$typeHandlerVersion = '2.1'

Set-AzureRmVMExtension  -ResourceGroupName $resourceGroupName -VMName $vmName1 -Location $storageAccount.Location `
-Name $extensionName -Publisher $publisher -ExtensionType $extensionType -TypeHandlerVersion $typeHandlerVersion `
-Settings $settingsHashTable

Set-AzureRmVMExtension  -ResourceGroupName $resourceGroupName -VMName $vmName2 -Location $storageAccount.location `
-Name $extensionName -Publisher $publisher -ExtensionType $extensionType -TypeHandlerVersion $typeHandlerVersion `
-Settings $settingsHashTable
