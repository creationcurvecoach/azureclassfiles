Function Create-SQLDB
# Create database in local SQL Server

{

    Write-Host "Creating local database..." -ForegroundColor Green
    SQLCMD -E -i D:\Labfiles\Lab07\Starter\Setupfiles\Setup.sql

}
