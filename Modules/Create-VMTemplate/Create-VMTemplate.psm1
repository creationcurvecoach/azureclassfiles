Function Create-VMTemplate


{
#Switch to D:\Configfiles\Azure-Template

cd D:\Configfiles\Azure-Template

#Sign in to your subscription

Login-AzureRMAccount

# Select the subscription in which you are going to create a virtual network

Get-AzureRMSubscription |Select-AzureRmSubscription


#Run Creation of VM by using Template

New-AzureRmResourceGroupDeployment -Name AdatumDomain -ResourceGroup AdatumRG -TemplateFile D:\Configfiles\Azure-Template\azuredeploy.json -TemplateParameterFile D:\Configfiles\Azure-Template\azuredeploy.parameters.json

#Double-check that VM has restarted after the dcpromo ...
$RGs = Get-AzureRMResourceGroup
$VM = Get-AzureRmVM -ResourceGroupName $RG.ResourceGroupName
$VMDetail = Get-AzureRmVM -ResourceGroupName $RG.ResourceGroupName -Name $VM.Name -Status
$VMstatus=""
$VMStatusDetail=""

foreach ($VMStatus in $VMDetail.Statuses)
        { 
            if($VMStatus.Code.CompareTo("PowerState/running") -eq 0)
            {
                $VMStatusDetail = $VMStatus.DisplayStatus
            }
        }
        write-output $VM.Name $VMStatusDetail

While ($VMStatusDetail -ne "VM running")
{
  Start-Sleep -Seconds 60
$VMDetail = Get-AzureRmVM -ResourceGroupName $RG.ResourceGroupName -Name $VM.Name -Status
$VMstatus=""
$VMStatusDetail=""
 foreach ($VMStatus in $VMDetail.Statuses)
        { 
            if($VMStatus.Code.CompareTo("PowerState/running") -eq 0)
            {
                $VMStatusDetail = $VMStatus.DisplayStatus
            }
        }
        write-output $VM.Name $VMStatusDetail
}

#Need to make sure that the DC has completely restarted before next steps:
Start-Sleep -Seconds 180




}