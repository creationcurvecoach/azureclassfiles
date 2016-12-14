# Sign in to your Azure subscription

Login-AzureRmAccount

# Retrieve the IP address used for the gateway in the ARM VNet and write down the address


$GWARM= Get-AzureRMPublicIpAddress | ?{$_.Name -eq "PIP"}

Write-Host "Write down the public IP Address for ARM VNet "$GWARM.IpAddress -ForegroundColor Green

Start-Sleep -Seconds 120


# Sign in to your Azure Subscription

Add-AzureAccount

Get-AzureVNetConfig -ExportToFile D:\Labfiles\Lab02\classicvnets.netcfg

# Open and edit the configuration file by modifying the section LocalNetworkSite element with IP address of the gateway for the ARM VNet obtained in previouse step.
#  <LocalNetworkSite name="HQ">
#   <AddressSpace>
#    <AddressPrefix>192.168.0.0/16</AddressPrefix>
#   </AddressSpace>
#   <VPNGatewayAddress>1.1.1.1</VPNGatewayAddress>
#  </LocalNetworkSite>

notepad D:\Labfiles\Lab02\classicvnets.netcfg

