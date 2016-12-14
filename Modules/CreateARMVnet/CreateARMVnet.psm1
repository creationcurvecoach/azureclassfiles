Function CreateARMVnet

{
#Sign in to your subscription

Login-AzureRMAccount

# Select the subscription in which you are going to create a virtual network

Get-AzureRMSubscription |Select-AzureRmSubscription


# Create a new resource group

New-AzureRMResourceGroup –Name AdatumRG –Location $location

# Create a new virtual network named AdatumVnet

New-AzureRMVirtualNetwork –ResourceGroupName AdatumRG –Name AdatumVnet –AddressPrefix 192.168.0.0/16 –Location $location

# Store the virtual object in a variable, type the following command

$vnet = Get-AzureRMVirtualNetwork –ResourceGroupName AdatumRG –Name AdatumVnet


# Add a subnet to the new Vnet variable

Add-AzureRmVirtualNetworkSubnetConfig -Name FrontEnd -VirtualNetwork $vnet -AddressPrefix 192.168.1.0/24

# Set the configuration in the virtual network

Set-AzureRMVirtualNetwork –VirtualNetwork $vnet



}