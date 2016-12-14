#This script creates a new IaaS v2 VM in the NewAppRG resource group
#connected to the DATABASE subnet of the HQ-VNET virtual network

#Sign in to Azure
Write-Host "Signing in to Azure..." -ForegroundColor Green
Login-AzureRmAccount

#Set Azure location
$locName = Read-Host "Enter location as string (eg: East US):" 

#Assign variables
$rgName="ResDevRG"
$vnetName = "HQ-VNET"
$subnetName = "DATABASE"
$vmName = "ResDevDB2"
$vmSize = "Standard_A1"
$pubName="MicrosoftWindowsServer"$offerName="WindowsServer"$skuName="2012-R2-Datacenter"
$nicName="resdevdb2"
$diskName="OSDisk"


$storageAcc = Get-AzureRmStorageAccount

$cred=Get-Credential -Message "Type the name and password of the local administrator account:"

#Set Virtual network and Subnet
$vnet = Get-AzureRmVirtualNetwork -Name $vnetName -ResourceGroupName $rgName
foreach ($subnet in $vnet.subnets)
{
    if ($subnet.name -eq $subnetName)
    {
        $subnetid = $subnet.Id        
    }
}

#Create PIP and NIC
$pip = New-AzureRmPublicIpAddress -Name $nicName -ResourceGroupName $rgName -Location $locName -AllocationMethod Dynamic
$nic = New-AzureRmNetworkInterface -Name $nicName -ResourceGroupName $rgName -Location $locName -SubnetId $subnetid -PublicIpAddressId $pip.Id

#Set VM Configuration
$vm=New-AzureRmVMConfig -VMName $vmName -VMSize $vmSize
$vm=Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id
$vm=Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName $vmName -Credential $cred $vm=Set-AzureRmVMSourceImage -VM $vm -PublisherName $pubName -Offer $offerName -Skus $skuName -Version "latest"$osDiskUri=$storageAcc.PrimaryEndpoints.Blob.ToString() + "vhds/" + $vmName + $diskName  + ".vhd"$vm=Set-AzureRmVMOSDisk -VM $vm -Name $diskName -VhdUri $osDiskUri -CreateOption fromImage

#Create the VM
New-AzureRmVM -ResourceGroupName $rgName -Location $locName -VM $vm