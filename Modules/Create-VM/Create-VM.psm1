Function Create-VM ($svrname, $servicename, $stype, $loc, $labno, $vmno, $vnet)
# Create an IaaS v1 virtual machine

{

    # Set variables
    $dnsname = 'ADATUM-DNS'    #Note: hard-coded in NetworkConfig.xml
    $subnet = 'Subnet-1'       #Note: hard-coded in NetworkConfig.xml
    $global:adminname = 'Student'
    $global:adminpassword = 'Pa$$w0rd123'
    $RDPfilesdir = 'D:\Labfiles\Lab' + "{0:00}" -f $labno + '\Starter\'
    $RDPendpoint = 3388 + $vmno
    $PSendpoint = 5985 + $vmno
    $instancesize = 'Small'    #Should be standard tier

    $svrimage = (Get-AzureVMImage | Where-Object { $_.ImageFamily -like "Windows Server 2012 R2*" } | Where-Object { $_.Location.Split(";") -contains $location} | Sort-Object -Property PublishedDate -Descending)[0].ImageName

    # Set DNS
    $dns = New-AzureDns -IPAddress 10.0.0.4 -Name $dnsname

    # Set the instance-specific variables
    If ($stype -EQ 'Server') { $winimage = $svrimage }

    $newVM = New-AzureVMConfig -name $svrname -InstanceSize $instancesize -ImageName $winimage | Add-AzureProvisioningConfig -Windows -AdminUsername $adminname -Password $adminpassword | Set-AzureEndpoint -Name "RemoteDesktop" -Protocol tcp -LocalPort 3389 -PublicPort $RDPendpoint | Set-AzureEndpoint -Name "PowerShell" -Protocol tcp -LocalPort 5986 -PublicPort $PSendpoint | Set-AzureSubnet -SubnetNames $subnet | Set-AzureVMBGInfoExtension -ReferenceName 'BGInfo'

    #Check if this is the first VM in the deployment
    $ErrorActionPreference = "SilentlyContinue"
    $deployment = Get-AzureService -ServiceName $servicename
    $ErrorActionPreference = "Continue"
    If ($deployment.ServiceName -eq $null) { 
        New-AzureVM -ServiceName $servicename -Location $loc -VMs $newVM -VNetName $vnet -WaitForBoot
    }
    Else {
        New-AzureVM -ServiceName $servicename -VMs $newVM -WaitForBoot
    }     

    $VMStatus = Get-AzureVM -ServiceName $servicename -Name $svrname
    While ($VMStatus.InstanceStatus -ne "ReadyRole")
    {
        Start-Sleep -Seconds 60
    $VMStatus = Get-AzureVM -ServiceName $servicename -Name $svrname
    }

    Start-Sleep -Seconds 60

    # Download the RDP file for this VM
    Get-AzureRemoteDesktopFile -ServiceName $servicename -Name $svrname -LocalPath "$RDPfilesdir$svrname.rdp" 

}