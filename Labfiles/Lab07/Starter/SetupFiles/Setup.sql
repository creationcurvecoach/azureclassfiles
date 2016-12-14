USE master
GO

IF EXISTS(SELECT * FROM sys.sysdatabases WHERE [name] = 'sales')
BEGIN
	ALTER DATABASE sales SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
	DROP DATABASE sales;
END
GO

CREATE DATABASE sales;
GO

USE sales;
GO

CREATE TABLE dbo.customer
(CustomerID integer identity primary key,
 FirstName nvarchar(50),
 LastName nvarchar(50));
GO

CREATE TABLE salesorder
(OrderID integer identity primary key,
 OrderDate datetime default getdate(),
 CustomerID integer,
 OrderTotal money)
GO

BULK INSERT sales.dbo.customer
FROM N'D:\Labfiles\Lab07\Starter\SetupFiles\CustomerData.txt'
WITH 
      (
         FIELDTERMINATOR =',',
         ROWTERMINATOR ='\n'
      );
GO

DECLARE @d datetime = eomonth(dateadd(yy, -1, getdate()))
WHILE @d <= eomonth(dateadd(mm, -1, getdate()))
BEGIN
	INSERT INTO salesorder (OrderDate, CustomerID, OrderTotal)
	SELECT @d, c.CustomerID, ((len(c.Firstname) * 10) - 0.01)
	FROM dbo.Customer c;

	SET @d = eomonth(@d, 1);

END
GO



