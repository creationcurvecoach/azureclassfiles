Login-AzureRmAccount
Add-AzureAccount

Show-SubscriptionARM
Show-Subscription

$rgNameARM = 'AdatumLabRG'
$armVNet = 'HQ'
$asmVNet = 'ADATUM-BRANCH-VNET'
$gatewayASMName = 'gatewayASM'
$gatewayARMName = 'gatewayARM'
$prefixVNetASM = '192.168.0.0/16'
$prefixVNetARM = '10.0.0.0/16'
$sharedKey = '12345'
$gatewayARMIP = 'gatewayARMIP'

$vnetARM = Get-AzureRmVirtualNetwork -ResourceGroupName $rgNameARM -Name $armVNet
Add-AzureRmVirtualNetworkSubnetConfig -Name GatewaySubnet -AddressPrefix 10.0.2.0/26 -VirtualNetwork $vnetARM
Set-AzureRmVirtualNetwork -VirtualNetwork $vnetARM 

$locationARM = $vnetARM.location
$locationASM = (Get-AzureVNetSite -VNetName $asmVNet).Location

$gatewayIPASM = (Get-AzureVNetGateway -VNetName $asmVNet).VIPAddress

New-AzureRmLocalNetworkGateway -Name $gatewayASMName -ResourceGroupName $rgNameARM -Location $locationASM -GatewayIpAddress $gatewayIPASM -AddressPrefix $prefixVNetASM

$gwARMpIP = New-AzureRmPublicIpAddress -Name $gatewayARMIP -ResourceGroupName $rgNameARM -Location $locationARM -AllocationMethod Dynamic
$gwARMsubnetconfig = (Get-AzureRmVirtualNetwork -Name $armVNet -ResourceGroupName $rgNameARM).Subnets[(Get-AzureRmVirtualNetwork -Name $armVNet -ResourceGroupName $rgNameARM).Subnets.Count -1]
$gwARMIPConfig = New-AzureRmVirtualNetworkGatewayIpConfig -Name gwARMipconfig -SubnetId $gwARMsubnetconfig.Id -PublicIpAddressId $gwARMpIP.Id

New-AzureRmVirtualNetworkGateway -Name $gatewayARMName -ResourceGroupName $rgNameARM -Location $locationARM -IpConfigurations $gwARMIPConfig -GatewayType Vpn -VpnType RouteBased

$vnetASMgateway = Get-AzureRmLocalNetworkGateway -Name $gatewayASMName -ResourceGroupName $rgNameARM
$vnetARMgateway = Get-AzureRmVirtualNetworkGateway -Name $gatewayARMName -ResourceGroupName $rgNameARM

New-AzureRMVirtualNetworkGatewayConnection -Name arm-asm-vnet-connection `
    -ResourceGroupName $rgNameARM -Location $locationARM -VirtualNetworkGateway1 $vnetARMgateway `
    -LocalNetworkGateway2 $vnetASMgateway -ConnectionType IPsec `
    -RoutingWeight 10 -SharedKey $sharedKey
