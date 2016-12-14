#Lab 01 Starter script - Using Azure PowerShell

#Variables
$locName = "East US" #Azure datacenter location
$rgName = "TestRG1" # test resource group created in Exercise 2
$newrgName ="TestWebRG" # resource group name to which the storage account will re-assigned
$webappName = "TestWebAppMMDDYYAB" #storage account name. This must be all lower case, and a name that is unique across Azure

#Create a new Web app in the TestRG1 resource group, using the variables above
New-AzureRmWebApp -Name $webappName -ResourceGroupName $rgname -Location $locName

#View the TestRG1 resource group
Get-AzureRmResource | Where {$_.ResourceGroupName -eq $rgName}

#Re-assign web app to the NewTestRG resource group
$resource = Get-AzureRmResource -ResourceName $webappname -ResourceGroupName $rgname
Move-AzureRmResource -DestinationResourceGroupName $newrgname -ResourceId $resource.ResourceId

#View the NewTestRG resource group resources
Get-AzureRmResource | Where {$_.ResourceGroupName -eq $newrgName}