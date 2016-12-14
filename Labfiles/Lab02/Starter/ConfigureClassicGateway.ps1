# Sign in to your Azure subscription

Login-AzureRmAccount
Show-SubscriptionARM

# Retrieve the IP address used for the gateway in the ARM VNet and write down the address

$GWARM= Get-AzureRMPublicIpAddress | ?{$_.ResourceGroupName -eq "AdatumLabRG" -and $_.Name -like "20533lab02pip*"}

Write-Host "Write down the public IP Address for ARM VNet "$GWARM.IpAddress -ForegroundColor Green

Write-Host "Press any key to continue... "

$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Sign in to your Azure Subscription

Add-AzureAccount
Show-Subscription

Get-AzureVNetConfig -ExportToFile D:\Labfiles\Lab02\classicvnets.netcfg

# Open and edit the configuration file by modifying the section LocalNetworkSite element with IP address of the gateway for the ARM VNet obtained in previouse step.
#  <LocalNetworkSite name="HQ">
#   <AddressSpace>
#    <AddressPrefix>192.168.0.0/16</AddressPrefix>
#   </AddressSpace>
#   <VPNGatewayAddress>1.1.1.1</VPNGatewayAddress>
#  </LocalNetworkSite>

Notepad D:\Labfiles\Lab02\classicvnets.netcfg

