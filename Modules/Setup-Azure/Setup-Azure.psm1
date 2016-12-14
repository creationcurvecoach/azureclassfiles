Function Setup-Azure
# Prepare for labs at the beginning of each module

{

    If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
    {
        Write-Host ""
 	Write-Warning "You do not have Administrator rights to run this script!`nMake sure to launch Windows PowerShell as Administrator!"
        Break
        Write-Host ""
    }

    cls

    # Variables
    $infoPath = 'D:\Configfiles\LabInfo.txt'

    # Get the lab number
    Write-Host ""
    Do {Write-Host -NoNewline "Which lab do you want to set up? Type a number from 1 - 11:   "  -ForegroundColor Magenta; [int]$labnumber=read-host} 
    while ((1..11) -notcontains $labnumber)

    Write-Host ""
    Write-Host "The lab you want to set up is: Lab" $labnumber -ForegroundColor Green
    Write-Host ""

    Do {
        # Confirm with user before proceeding
        Write-Host -NoNewline "Is this is correct? Y/N?:   "  -ForegroundColor Magenta; $answer=read-host

        Switch ($answer)
        {
            Y {Write-Host "The lab to set up is: Lab" $labnumber -ForegroundColor Yellow}
            N { Return }
            Default {continue}
        }
    } While ($answer -notmatch "[YN]")

    Start-Transcript -Path "D:\Logs\Setup-Azure-$labnumber.log" -IncludeInvocationHeader -Append -Force

    # Display information about the setup steps
    $lab = $labnumber -1
    Get-Content $infoPath | Select-Object -Index $lab

    Write-Host ""
    Write-Host "Now setting up Lab" $labnumber -ForegroundColor White

    # Store the start time
    $starttime = Get-Date

    # Select the setup steps required for this lab
    Switch ($labnumber)
    {
        1 { }
        2 { Add-AzureAccount | Out-Null; Show-Subscription; Choose-Location; Create-Names $labnumber; Create-Storage $storeName $location; Create-VirtualNetwork $labnumber; Create-VM "ClassicSrv1" $svcName "Server" $location $labnumber 1 "ADATUM-BRANCH-VNET"}
        3 { Login-AzureRmAccount | Out-Null; Add-AzureAccount | Out-Null; Show-SubscriptionARM; Show-Subscription; Choose-Location; Create-VNetARM "ResDevRG" "HQ-VNET" "192.168.0.0/16" @("App","Database","Web") @("192.168.1.0/24","192.168.2.0/24","192.168.3.0/24")}
        4 { }
        5 { }
        6 { Add-AzureAccount | Out-Null; Show-Subscription; Choose-Location; Create-Names $labnumber; Create-Storage $storeName $location; Create-VirtualNetwork $labnumber; Create-VM "AdatumSvr1" $svcName "Server" $location $labnumber 1 "ADATUM-HQ-VNET"}
        7 { Create-SQLDB }
        8 { }
        9 { }
        10 { Add-AzureAccount | Out-Null; Show-Subscription; Choose-Location; Create-Names $labnumber; Create-Storage $storeName $location; Create-VirtualNetwork $labnumber; Create-VM "AdatumDC1" $svcName "Server" $location $labnumber 1 "ADATUM-HQ-VNET"; Disable-IEESC "AdatumDC1" $svcName; Install-AD "AdatumDC1" $svcName $labnumber} 
        11 { Add-AzureAccount | Out-Null; Show-Subscription; Choose-Location; Create-Names $labnumber; Create-Storage $storeName $location; Create-VirtualNetwork $labnumber; Create-VM "AdatumSvr1" $svcName "Server" $location $labnumber 1 "ADATUM-HQ-VNET"}
    }

    # Remove cached Azure subscriptions and accounts from local PowerShell environment, ready for lab
    Write-Host "Removing cached Azure subscriptions and accounts info..."
    Remove-SubsAndAccounts

    # Write status message
    Write-Host ""
    Write-Host "Lab" $labnumber "setup is complete" -ForegroundColor Green

    # Display time taken for script to complete
    $endtime = Get-Date
    Write-Host Started at $starttime -ForegroundColor Magenta
    Write-Host Ended at $endtime -ForegroundColor Yellow
    Write-Host " "
    $elapsed = $endtime - $starttime

    If ($elapsed.Hours -ne 0){
        Write-Host Total elapsed time is $elapsed.Hours hours $elapsed.Minutes minutes -ForegroundColor Green
    }
    Else {
        Write-Host Total elapsed time is $elapsed.Minutes minutes -ForegroundColor Green
    }
    Write-Host " "

    Stop-Transcript

}