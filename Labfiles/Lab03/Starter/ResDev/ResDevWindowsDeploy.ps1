$deploymentName	= "WebTierDeployment"


$templateFile	= "D:\Labfiles\Lab03\Starter\ResDev\ResDevWindowsDeployTemplate.json"


$rgName		= "ResDevRG"


New-AzureRmResourceGroupDeployment -Name $deploymentName -ResourceGroupName $rgName -TemplateFile $templateFile
