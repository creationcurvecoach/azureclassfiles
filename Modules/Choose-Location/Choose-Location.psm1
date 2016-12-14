Function Choose-Location
#Get the current list of Azure regions

{

    $hash = Get-AzureLocation | Group-Object DisplayName -AsHashTable
    
    #Add an index number for students to select locations by
    $counter = 0

    foreach($key in $($hash.keys)){
        $counter++
        $hash[$key] = $counter
    }

    #Display the list, and ask for the index number
    $hash
    Write-Host -NoNewline "Enter the number (value) of the Azure region to use: "  -ForegroundColor Magenta; $locationnumber=read-host 

    #Display the chosen location
    $global:location = $hash.Keys | ? { $hash[$_] -eq $locationnumber }
    Write-Host "Your Azure region is: " $global:location -ForegroundColor Green

}