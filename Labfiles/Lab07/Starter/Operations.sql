
-- Create a table
CREATE TABLE dbo.serverlist
(server_name NVARCHAR(50) PRIMARY KEY,
 ip_address nvarchar(20));
GO

-- Insert some data
INSERT INTO dbo.serverlist
VALUES
('server1', '10.10.0.61');

INSERT INTO dbo.serverlist
VALUES
('server2', '10.10.0.62');

INSERT INTO dbo.serverlist
VALUES
('server3', '10.10.0.63');
