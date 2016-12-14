
$vnet01gateway = Get-AzureRMLocalNetworkGateway -Name LocalGW -ResourceGroupName VnetResourceGroup
$vnet02gateway = Get-AzureRMVirtualNetworkGateway -Name ARMGW -ResourceGroupName VnetResourceGroup

New-AzureRMVirtualNetworkGatewayConnection -Name arm-asm-s2s-connection `
    -ResourceGroupName VnetResourceGroup -Location "Central US" -VirtualNetworkGateway1 $vnet02gateway `
    -LocalNetworkGateway2 $vnet01gateway -ConnectionType IPsec `
    -RoutingWeight 10 -SharedKey 'abs123'