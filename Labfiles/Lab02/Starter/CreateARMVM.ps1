# Set variables:
$stName = "adatumsa"
$locName = "Central US"
$rgName = "AdatumRG"

# Store the start time
$starttime = Get-Date

# Get the default subscription name
$subname = ""
foreach ($sub in Get-AzureSubscription)
{
    if ($sub.IsDefault -eq "True")
    {
        $subname = $sub.SubscriptionName
    }
}

#Display the default subscription for the logged in account
Write-Host "Your default subscription is named"$subname -ForegroundColor Green

Write-Host ""
Write-Host "Setting location ..." -ForegroundColor Yellow
Write-Host ""
Choose-Location #generates $location

# Get unique names
Create-Names #generates $storeName, $svcName

# Create storage for VM2:
Write-Host "Creating storage account $storeName ..." -ForegroundColor Green
$storageAcc = New-AzureRmStorageAccount -ResourceGroupName $rgName -Name $stName -Type "Standard_GRS" -Location $locName

Write-Host "Waiting for storage to provision ..." -ForegroundColor Green
Start-Sleep -Seconds 60

Write-Host "Select your VNet ..." -ForegroundColor Green
Start-Sleep -Seconds 60

$vnet = Get-AzureRmVirtualNetwork -Name AdatumVnet -ResourceGroupName $rgName

Write-Host "Create Public IP address ..." -ForegroundColor Green
$pip = New-AzureRmPublicIpAddress -Name TestPIP -ResourceGroupName $rgName -Location $locName -AllocationMethod Dynamic
Start-Sleep -Seconds 60

Write-Host "Create NIC ..." -ForegroundColor Green
$nic = New-AzureRmNetworkInterface -Name TestNIC -ResourceGroupName $rgName -Location $locName -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $pip.Id

$cred = Get-Credential -Message "Type the name and password of the local administrator account."

Write-Host "Create a VM ..." -ForegroundColor Green

$vm = New-AzureRmVMConfig -VMName WindowsVM -VMSize "Standard_A1"
$vm = Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName MyWindowsVM -Credential $cred -ProvisionVMAgent -EnableAutoUpdate
$vm = Set-AzureRmVMSourceImage -VM $vm -PublisherName MicrosoftWindowsServer -Offer WindowsServer -Skus 2012-R2-Datacenter -Version "latest"
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id
$osDiskUri = $storageAcc.PrimaryEndpoints.Blob.ToString() + "vhds/WindowsVMosDisk.vhd"
$vm = Set-AzureRmVMOSDisk -VM $vm -Name "windowsvmosdisk" -VhdUri $osDiskUri -CreateOption fromImage
New-AzureRmVM -ResourceGroupName $rgName -Location $locName -VM $vm 
