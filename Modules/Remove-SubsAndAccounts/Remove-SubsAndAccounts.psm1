Function Remove-SubsAndAccounts
# Clear cached Service Management Azure account and subscription settings from the current PowerShell session

{

    Write-Host "Removing local Azure subscription certificates..."
    foreach ($sub in Get-AzureSubscription)
    {
        if ($sub.SubscriptionName)
        {
            Remove-AzureSubscription -SubscriptionName $sub.SubscriptionName -Force -WarningAction SilentlyContinue
        }
    }

    Write-Host "Signing out of Azure..."
    foreach ($acct in Get-AzureAccount)
    {
        Remove-AzureAccount $acct.Id -Force
    }

}
