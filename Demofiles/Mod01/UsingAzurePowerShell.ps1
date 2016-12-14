#Mod 01 Demo script - Using Azure PowerShell

#Update the following variables to reflect your choices. 
#You must change the value for $saName
$locName = "East US" #Azure datacenter location
$rgName = "TestRG1" #resource group name
$saName = "<enter unique name here>" #storage account name. This must be all lower case, and a name that is unique across Azure
$saType = "Standard_LRS" #storage account type
$newsaType = "Standard_GRS" #storage account type to which the storage account will be updated.

#Create resource groups
New-AzureRmResourceGroup -Name $rgName -Location $locName

#Create a storage account
New-AzureRmStorageAccount -Name $saName -ResourceGroupName $rgName –Type $saType -Location $locName

#Re-assign storage account to new resource group
Set-AzureRmStorageAccount -Name $saName -ResourceGroupName $rgName –Type $newsaType

#Delete storage account
Remove-AzureRmStorageAccount -Name $saName -ResourceGroupName $rgName

#View storage accounts
Get-AzureRmStorageAccount

#Delete resource groups
Remove-AzureRmResourceGroup -Name $rgName

#View resource groups
Get-AzureRmResourceGroup

#End of script