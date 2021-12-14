USE [insta]
GO

DECLARE @ProcName varchar(500)
DECLARE Cur cursor 

FOR SELECT [Name] FROM sys.objects WHERE [type] = 'p' AND is_ms_shipped = 0
OPEN Cur
FETCH NEXT FROM Cur INTO @ProcName
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC('DROP PROCEDURE ' + @ProcName)
    FETCH NEXT FROM Cur INTO @ProcName
END
CLOSE Cur
DEALLOCATE Cur

GO


DECLARE @FuncName varchar(500)
DECLARE Cur cursor 

FOR SELECT [Name] 
FROM sys.objects 
WHERE [type] IN (N'FN', N'IF', N'TF', N'FS', N'FT') AND is_ms_shipped = 0
OPEN Cur
FETCH NEXT FROM Cur INTO @FuncName
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC('DROP FUNCTION ' + @FuncName)
    FETCH NEXT FROM Cur INTO @FuncName
END
CLOSE Cur
DEALLOCATE Cur

GO


DECLARE @TypeName varchar(500)
DECLARE Cur cursor 

FOR SELECT [Name] 
FROM sys.types
WHERE is_user_defined = 1
OPEN Cur
FETCH NEXT FROM Cur INTO @TypeName
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC('DROP TYPE ' + @TypeName)
    FETCH NEXT FROM Cur INTO @TypeName
END
CLOSE Cur
DEALLOCATE Cur

GO



DECLARE @ViewName varchar(500)
DECLARE Cur cursor 

FOR SELECT [Name] 
FROM sys.views
OPEN Cur
FETCH NEXT FROM Cur INTO @ViewName
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC('DROP VIEW ' + @ViewName)
    FETCH NEXT FROM Cur INTO @ViewName
END
CLOSE Cur
DEALLOCATE Cur

GO
