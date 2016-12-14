Function Show-Subscription
# Select the target subscription (Service Management)

{

    $subs = Get-AzureSubscription

    #Check the number of subscriptions associated with the current account 

    if($subs.Count -eq 0)
    {
        Write-Host "No subscriptions found. Sign in with an account that is associated with an Azure subscription"
        Return
    }
    elseif($subscriptionId)
    {
        Write-Host "Subscription already selected - using the subscription: " $subscriptionId " (Service Management)"
        Select-AzureSubscription -SubscriptionId $subscriptionId -Current
    }
    elseif($subs.Count -gt 1)
    {
        while($true)
        {
            for($i = 1;$i -lt ($subs.Count + 1); $i++)
            {
                Write-Host "[$i] - " $subs[$i-1].SubscriptionName "- Id: " $subs[$i-1].SubscriptionId
            }

            Write-Host 
            $selectedSub = Read-Host -Prompt "Select the Azure subscription" 
            Write-Host 
            [int] $selectedEntry = $null
            if([int32]::TryParse($selectedSub, [ref]$selectedEntry) -eq $true)
            {
                if($selectedEntry -ge 1 -and $selectedEntry -lt ($subs.Count + 1))
                {
                    Write-Host "Using subscription: " $subs[$selectedEntry - 1].SubscriptionName " Id: " $subs[$selectedEntry - 1].SubscriptionId " (Service Management)"
                    Select-AzureSubscription -SubscriptionName $subs[$selectedEntry - 1].SubscriptionName -Current
		    $global:subscriptionId = $subs[$selectedEntry - 1].SubscriptionId
                    break               
                }
            }
        }
    }
    else 
    {
        Write-Host "Using the subscription: " $subs[0].SubscriptionName " Id: " $subs[0].SubscriptionId " (Service Management)"
        Select-AzureSubscription -SubscriptionName $subs[0].SubscriptionName -Current
    }

}