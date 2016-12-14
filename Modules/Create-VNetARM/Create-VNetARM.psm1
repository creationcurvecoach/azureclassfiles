Function Create-VNetARM ($rgName, $vNetName, $vNetPrefix, $vNetSubnets, $vNetSubnetsPrefixes)
# Create an IaaS v2 virtual network

{

    # Create a new resource group
    New-AzureRMResourceGroup –Name $rgName –Location $location

    # Create a new virtual network 
    $vnet = New-AzureRMVirtualNetwork –ResourceGroupName $rgName –Name $vNetName –AddressPrefix $vNetPrefix –Location $location

    # Add subnets to the virtual network
    for ($i=0; $i -lt $vNetSubnets.Length; $i++) {
	Add-AzureRmVirtualNetworkSubnetConfig -Name $vNetSubnets[$i] -VirtualNetwork $vnet -AddressPrefix $vNetSubnetsPrefixes[$i]
    }

    # Update the configuration of the virtual network
    Set-AzureRMVirtualNetwork –VirtualNetwork $vnet

}