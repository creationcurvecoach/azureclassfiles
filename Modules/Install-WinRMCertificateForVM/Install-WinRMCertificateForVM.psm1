Function Install-WinRMCertificateForVM ($servicename, $svrname)
# Set up WinRM connectivity to an IaaS v1 virtual machine

{

    Write-Verbose "Installing WinRM Certificate for remote access: $servicename $svrname"
    $WinRMCert = (Get-AzureVM -ServiceName $servicename -Name $svrname | select -ExpandProperty vm).DefaultWinRMCertificateThumbprint
    $AzureX509cert = Get-AzureCertificate -ServiceName $servicename -Thumbprint $WinRMCert -ThumbprintAlgorithm sha1

    $certTempFile = [IO.Path]::GetTempFileName()
    $AzureX509cert.Data | Out-File $certTempFile

    # Target The Cert That Needs To Be Imported
    $CertToImport = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $certTempFile

    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store "Root", "LocalMachine"
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $store.Add($CertToImport)
    $store.Close()
	
    Remove-Item $certTempFile

}