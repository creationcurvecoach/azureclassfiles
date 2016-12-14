Function Install-AD ($svrname, $servicename, $labno)
# Install AD DS domain controller on an IaaS v1 virtual machine

{
    # Additional variables
    $adminname = 'Student'
    $adminpassword = 'Pa$$w0rd123'
    $userpassword = 'Pa$$w0rd123'
    $fulldomain = 'adatum.com'
    $shortdomain = 'ADATUM'
    $basedn = "dc=adatum,dc=com"
    $orgunit = 'Accounts'
    $baseou = "ou=Accounts,dc=adatum,dc=com"
    $labfilesdir = 'D:\Labfiles\Lab' + "{0:00}" -f $labno + '\Starter\'
    $usernamesCSV = 'UserNames.csv'

    # Install the WinRM Certificate first to access the VM via Remote PS
    Install-WinRMCertificateForVM $servicename $svrname

    # Return back the correct URI for Remote PowerShell
    $uri = Get-AzureWinRMUri -ServiceName $servicename -Name $svrname
    $SecurePassword = $adminpassword | ConvertTo-SecureString -AsPlainText -Force
    $credential = new-object -typename System.Management.Automation.PSCredential -argumentlist $adminname,$SecurePassword

    # Install and configure AD
    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -ScriptBlock {
        param($dn,$dnn,$adminpwd)
        Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
        Import-Module ADDSDeployment
        Install-ADDSForest `
         -CreateDnsDelegation:$false `
         -DatabasePath "C:\Windows\NTDS" `
         -DomainMode "Win2012" `
         -DomainName $dn `
         -DomainNetbiosName $dnn `
         -ForestMode "Win2012" `
         -InstallDns:$true `
         -LogPath "C:\Windows\NTDS" `
         -NoRebootOnCompletion:$false `
         -SysvolPath "C:\Windows\SYSVOL" `
         -Force:$true `
         -SafeModeAdministratorPassword (ConvertTo-SecureString $adminpwd -AsPlainText -Force)
    } -ArgumentList $fulldomain,$shortdomain,$adminpassword

    #Double-check that VM has restarted after the dcpromo ...
    $VMStatus = Get-AzureVM -ServiceName $servicename -Name $svrname
    While ($VMStatus.InstanceStatus -ne "ReadyRole")
    {
        Start-Sleep -Seconds 60
        $VMStatus = Get-AzureVM -ServiceName $servicename -Name $svrname
    }

    #Need to make sure that the DC has completely restarted before next steps:
    Start-Sleep -Seconds 600

    #Create OU
    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -ScriptBlock {
        param ($bdn,$ou)
        New-ADOrganizationalUnit -Name $ou -Path $bdn -ProtectedFromAccidentalDeletion $false
    } -ArgumentList $basedn,$orgunit

    #Create users, using CSV file, first upload the CSV file to the DC:
    $fullpath = $labfilesdir + $usernamesCSV
    $content = Get-Content $fullpath

    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -script {
        param($filename,$contents)
        set-content -path $filename -value $contents
    } -argumentlist $usernamesCSV,$content

    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -ScriptBlock {
        param ($uCSV,$upassword,$fdomain,$ou)
        $file = Import-Csv $uCSV
        $UserSecurePassword = $upassword | ConvertTo-SecureString -AsPlainText -Force

        foreach($row in $file){
            $SamAccountName = $row.FirstName.Substring(0,1) + $row.Surname
            $SamAccountName = $SamAccountName.ToLower()
            $UserPrincipalName = $SamAccountName + "@" + $fdomain
            $DisplayName = $row.FirstName + " " + $row.Surname
            $Name = $DisplayName + " (" + $SamAccountName + ")"
            New-ADUser -Name $Name -DisplayName $DisplayName -AccountPassword $UserSecurePassword -GivenName $row.FirstName -Initials $row.MiddleInitial -SamAccountName $SamAccountName -Surname $row.Surname -UserPrincipalName $UserPrincipalName -EmailAddress $UserPrincipalName -Enabled $true -Path $ou
            Write-Host $DisplayName
        }
    } -ArgumentList $usernamesCSV,$userpassword,$fulldomain,$baseou

    # Disable Windows Firewall:
    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -ScriptBlock {
        Set-NetFirewallProfile -All -Enabled False 
    }
}