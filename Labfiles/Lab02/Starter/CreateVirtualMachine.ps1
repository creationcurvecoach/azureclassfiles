# Set variables:
$rgName = "AdatumLabRG"
$vnetName = "HQ"
$vmName = "ARMSrv2"

# Store the start time
$starttime = Get-Date

Login-AzureRmAccount
Add-AzureAccount

Show-SubscriptionARM
Show-Subscription

$vnet = Get-AzureRmVirtualNetwork -Name $vnetName -ResourceGroupName $rgName

$location = $vnet.Location

# Get unique names
Create-Names 2 #generates $storeName, $svcName

# Create storage account:
Write-Host "Creating storage account $storeName ..." -ForegroundColor Green
$storageAcc = New-AzureRmStorageAccount -ResourceGroupName $rgName -Name $storeName -Type "Standard_LRS" -Location $location

Write-Host "Waiting for storage to provision ..." -ForegroundColor Green
Start-Sleep -Seconds 60

Write-Host "Identifying the VNet ..." -ForegroundColor Green
Start-Sleep -Seconds 60

$uniqueNumber = (Get-Date).Ticks.ToString().Substring(12)
$pipName = '20533lab02pip' + $uniqueNumber
$nicName = '20533lab02nic' + $uniqueNumber

Write-Host "Creating Public IP address ..." -ForegroundColor Green
$pip = New-AzureRmPublicIpAddress -Name $pipName -ResourceGroupName $rgName -Location $location -AllocationMethod Dynamic
Start-Sleep -Seconds 60

Write-Host "Creating NIC ..." -ForegroundColor Green
$nic = New-AzureRmNetworkInterface -Name $nicName -ResourceGroupName $rgName -Location $location -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $pip.Id

$adminUsername = 'Student'
$adminPassword = 'Pa$$w0rd123'

$cred = New-Object PSCredential $adminUsername, ($adminPassword | ConvertTo-SecureString -AsPlainText -Force) 

Write-Host "Creating a VM ..." -ForegroundColor Green

$vm = New-AzureRmVMConfig -VMName $vmName -VMSize "Standard_A1"
$vm = Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName MyWindowsVM -Credential $cred -ProvisionVMAgent -EnableAutoUpdate
$vm = Set-AzureRmVMSourceImage -VM $vm -PublisherName MicrosoftWindowsServer -Offer WindowsServer -Skus 2012-R2-Datacenter -Version "latest"
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id
$osDiskUri = $storageAcc.PrimaryEndpoints.Blob.ToString() + "vhds/WindowsVMosDisk.vhd"
$vm = Set-AzureRmVMOSDisk -VM $vm -Name "windowsvmosdisk" -VhdUri $osDiskUri -CreateOption fromImage
New-AzureRmVM -ResourceGroupName $rgName -Location $location -VM $vm 

# Display time taken for script to complete
$endtime = Get-Date
Write-Host Started at $starttime -ForegroundColor Magenta
Write-Host Ended at $endtime -ForegroundColor Yellow
Write-Host " "
$elapsed = $endtime - $starttime

If ($elapsed.Hours -ne 0){
  Write-Host Total elapsed time is $elapsed.Hours hours $elapsed.Minutes minutes -ForegroundColor Green
}
Else {
  Write-Host Total elapsed time is $elapsed.Minutes minutes -ForegroundColor Green
}
Write-Host " "