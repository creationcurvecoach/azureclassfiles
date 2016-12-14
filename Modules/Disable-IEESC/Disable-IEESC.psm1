Function Disable-IEESC ($svrname, $servicename)
# Disable IEESC on an Azure IaaS v1 virtual machine

{

    #Admin account variables
    $adminname = 'Student'
    $adminpassword = 'Pa$$w0rd123'
    $shortdomain = 'ADATUM'

    # Install the WinRM Certificate first to access the VM via Remote PS
    Install-WinRMCertificateForVM $servicename $svrname

    # Return back the correct URI for Remote PowerShell
    $uri = Get-AzureWinRMUri -ServiceName $servicename -Name $svrname
    $SecurePassword = $adminpassword | ConvertTo-SecureString -AsPlainText -Force
    $credential = new-object -typename System.Management.Automation.PSCredential -argumentlist $adminname,$SecurePassword

    # Disable IEESC for Administrators
    # Specify registry key, entry, and value
    $regKey = "HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}"
    $regEntryName = "IsInstalled"
    $regEntryValue = 0

    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -script {
        param($path,$name,$value)
        Set-ItemProperty -Path $path -Name $name -Value $value
    } -argumentlist $regKey, $regEntryName, $regEntryValue

    # Disable IEESC for Users
    # Specify registry key, entry, and value
    $regKey = "HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}"
    $regEntryName = "IsInstalled"
    $regEntryValue = 0

    Invoke-Command -ConnectionUri $uri.ToString() -Credential $credential -script {
        param($path,$name,$value)
        Set-ItemProperty -Path $path -Name $name -Value $value
    } -argumentlist $regKey, $regEntryName, $regEntryValue

}
