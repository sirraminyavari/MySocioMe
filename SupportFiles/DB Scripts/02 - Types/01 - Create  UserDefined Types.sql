/****** Object:  StoredProcedure [dbo].[AddFolder]    Script Date: 03/14/2012 11:38:59 ******/
USE [insta]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'StringTableType')
--DROP TYPE dbo.StringTableType

CREATE TYPE [dbo].[StringTableType] AS TABLE
(Value nvarchar(4000) NULL, SequenceNumber int IDENTITY(1,1));
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'KeyLessStringTableType')
--DROP TYPE dbo.KeyLessStringTableType

CREATE TYPE [dbo].[KeyLessStringTableType] AS TABLE
(Value nvarchar(4000) NULL);
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'StringPairTableType')
--DROP TYPE dbo.StringPairTableType

CREATE TYPE [dbo].[StringPairTableType] AS TABLE
(FirstValue nvarchar(4000) NULL, SecondValue nvarchar(4000) NULL);
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'BigintStringTableType')
--DROP TYPE dbo.BigintStringTableType

CREATE TYPE [dbo].[BigintStringTableType] AS TABLE
(FirstValue bigint NULL, SecondValue nvarchar(4000) NULL);
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'BigintTableType')
--DROP TYPE dbo.BigintTableType

CREATE TYPE [dbo].[BigintTableType] AS TABLE
(Value bigint NULL);
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'BigintPairTableType')
--DROP TYPE dbo.BigintPairTableType

CREATE TYPE [dbo].[BigintPairTableType] AS TABLE
(FirstValue bigint NULL, SecondValue bigint NULL);
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'UserTableType')
--DROP TYPE dbo.UserTableType

CREATE TYPE [dbo].[UserTableType] AS TABLE(
	UserID varchar(50) NULL,
	UserName nvarchar(100) NULL,
	FullName nvarchar(200) NULL,
	Biography nvarchar(400) NULL,
	Website nvarchar(100) NULL,
	Media int NULL,
	Follows int NULL,
	Followers int NULL,
	ImageURL varchar(300) NULL
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'MediaTagTableType')
--DROP TYPE dbo.MediaTagTableType

CREATE TYPE [dbo].[MediaTagTableType] AS TABLE(
	MediaID varchar(50) NULL,
	TagID bigint NULL,
	Name nvarchar(200) NULL,
	MediaCount int NULL
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'MediaTableType')
--DROP TYPE dbo.MediaTableType

CREATE TYPE [dbo].[MediaTableType] AS TABLE(
	MediaID varchar(50) NULL,
	UserID varchar(50) NULL,
	[Type] varchar(20) NULL,
	CreationTime datetime NULL,
	Likes int NULL,
	Comments int NULL,
	LocationID varchar(500) NULL,
	LocationName nvarchar(1000) NULL,
	Latitude float NULL,
	Longitude float NULL,
	Caption nvarchar(1000) NULL,
	ImageURL varchar(300) NULL,
	VideoURL varchar(300) NULL
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'MediaFanTableType')
--DROP TYPE dbo.MediaFanTableType

CREATE TYPE [dbo].[MediaFanTableType] AS TABLE(
	MediaID	varchar(50) NULL,
	UserID varchar(50) NULL,
	Liked bit NULL,
	Commented bit NULL
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'FollowSuggestionTableType')
--DROP TYPE dbo.FollowSuggestionTableType

CREATE TYPE [dbo].[FollowSuggestionTableType] AS TABLE(
	UserID varchar(50) NULL,
	SuggestedUserID varchar(50) NULL,
	BookmarkedLocationID bigint
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'LocationTableType')
--DROP TYPE dbo.LocationTableType

CREATE TYPE [dbo].[LocationTableType] AS TABLE(
	ID bigint NULL,
	Name nvarchar(1000) NULL,
	Alias nvarchar(1000) NULL,
	Latitude float NULL,
	Longitude float NULL,
	Radius int NULL
)
GO


IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'IPGLogTableType')
--DROP TYPE dbo.IPGLogTableType

CREATE TYPE [dbo].[IPGLogTableType] AS TABLE (
	[Action] varchar(50) NULL,
	UserID varchar(50) NULL,
	DeviceID varchar(50) NULL,
	DeviceModel	varchar(255) NULL,
	TargetUserID varchar(50) NULL,
	[Time] datetime NULL
)
GO

