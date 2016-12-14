# This script creates a new IaaS v2 VM

# Sign in to Azure
Write-Host "Signing in to Azure..." -ForegroundColor Green
Login-AzureRmAccount

Show-SubscriptionARM

# Assign variables

$rgName		= "ResDevRG"

$vnetName 	= "HQ-VNET"

$subnetName 	= "Database"

$vmName 	= "ResDevDB2"

$vmSize 	= "Standard_A1"

$pubName	= "MicrosoftWindowsServer"

$offerName	= "WindowsServer"

$skuName	= "2012-R2-Datacenter"
$diskName	= "OSDisk"

# Identify virtual network and subnet

$vnet 		= Get-AzureRmVirtualNetwork -Name $vnetName -ResourceGroupName $rgName

foreach ($subnet in $vnet.subnets)
{
    if ($subnet.name -eq $subnetName)
    {
        $subnetid = $subnet.Id        
    }
}


$location 	= $vnet.Location

$storageAccount = (Get-AzureRmStorageAccount | Where-Object {($_.Location -eq $location) -and ($_.ResourceGroupName -eq $rgName) -and ($_.StorageAccountName -like $($rgName.ToLower() + "disks*"))})[0]

$adminUsername = 'Student'
$adminPassword = 'Pa$$w0rd1234'
$adminCreds 	= New-Object PSCredential $adminUsername, ($adminPassword | ConvertTo-SecureString -AsPlainText -Force) 

$uniqueNumber = (Get-Date).Ticks.ToString().Substring(12)
$pipName = '20533lab03pip' + $uniqueNumber
$nicName = '20533lab03nic' + $uniqueNumber

# Create PIP and NIC

$pip 		= New-AzureRmPublicIpAddress -Name $nicName -ResourceGroupName $rgName -Location $location -AllocationMethod Dynamic

$nic 		= New-AzureRmNetworkInterface -Name $pipName -ResourceGroupName $rgName -Location $location -SubnetId $subnetid -PublicIpAddressId $pip.Id



# Set VM Configuration

$vm		= New-AzureRmVMConfig -VMName $vmName -VMSize $vmSize
$vm		= Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id

$vm		= Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName $vmName -Credential $adminCreds 

$vm		= Set-AzureRmVMSourceImage -VM $vm -PublisherName $pubName -Offer $offerName -Skus $skuName -Version "latest"



$osDiskUri	= $storageAccount.PrimaryEndpoints.Blob.ToString() + "vhds/" + $vmName + $diskName  + ".vhd"

$vm		= Set-AzureRmVMOSDisk -VM $vm -Name $diskName -VhdUri $osDiskUri -CreateOption fromImage


#Create the VM

New-AzureRmVM -ResourceGroupName $rgName -Location $location -VM $vm

