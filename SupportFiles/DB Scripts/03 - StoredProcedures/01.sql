USE [mysociome_com_msm]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SaveErrorLog]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SaveErrorLog]
GO

CREATE PROCEDURE [dbo].[SaveErrorLog]
	@UserID				varchar(50),
	@Subject			varchar(1000),
	@Description		nvarchar(2000),
	@Time				datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON

	INSERT INTO [dbo].[ErrorLogs](
		UserID,
		[Subject],
		[Description],
		[Time]
	)
	VALUES (
		@UserID, 
		@Subject, 
		@Description, 
		@Time
	)
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UpdateUsers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UpdateUsers]
GO

CREATE PROCEDURE [dbo].[UpdateUsers]
	@Users		UserTableType readonly,
	@Override	bit
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE USR
		SET UserName = U.UserName,
			FullName = U.FullName,
			ImageURL = U.ImageURL,
			Biography = CASE WHEN @Override = 1 THEN U.Biography ELSE ISNULL(U.Biography, USR.Biography) END,
			Website = CASE WHEN @Override = 1 THEN U.Website ELSE ISNULL(U.Website, USR.Website) END,
			Media = CASE WHEN @Override = 1 THEN ISNULL(U.Media, 0) ELSE ISNULL(U.Media, USR.Media) END,
			Follows = CASE WHEN @Override = 1 THEN ISNULL(U.Follows, 0) ELSE ISNULL(U.Follows, USR.Follows) END,
			Followers = CASE WHEN @Override = 1 THEN ISNULL(U.Followers, 0) ELSE ISNULL(U.Followers, USR.Followers) END
	FROM @Users AS U
		INNER JOIN [dbo].[Users] AS USR
		ON USR.UserID = U.UserID
		
	INSERT INTO [dbo].[Users](
		UserID, UserName, FullName, Biography, Website, Media,
		Follows, Followers, [Private], Activated, ImageURL
	)
	SELECT	U.UserID, U.UserName, U.FullName, U.Biography, U.Website, 
			ISNULL(U.Media, 0), ISNULL(U.Follows, 0), ISNULL(U.Followers, 0), 
			0, 0, U.ImageURL
	FROM @Users AS U
		LEFT JOIN [dbo].[Users] AS USR
		ON USR.UserID = U.UserID
	WHERE USR.UserID IS NULL
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[ActivateUser]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[ActivateUser]
GO

CREATE PROCEDURE [dbo].[ActivateUser]
	@UserID				varchar(50),
	@UserName			nvarchar(100),
	@FullName			nvarchar(200),
	@Code				varchar(100),
	@Token				varchar(100),
	@LocalToken			varchar(100),
	@InvitedByUserID	varchar(50),
	@ImageURL			varchar(300)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF @InvitedByUserID IS NOT NULL AND NOT EXISTS (
		SELECT TOP(1) UserID
		FROM [dbo].[Users]
		WHERE UserID = @InvitedByUserID AND Activated = 1
	) SET @InvitedByUserID = NULL
	
	IF @InvitedByUserID = @UserID SET @InvitedByUserID = NULL
	
	IF EXISTS(SELECT TOP(1) UserID FROM [dbo].[Users] WHERE UserID = @UserID) BEGIn
		UPDATE [dbo].[Users]
			SET UserName = @UserName,
				Code = @Code,
				Token = @Token,
				LocalToken = ISNULL(@LocalToken, LocalToken),
				Activated = 1,
				InvitedByUserID = CASE WHEN Activated = 1 THEN InvitedByUserID ELSE ISNULL(InvitedByUserID, @InvitedByUserID) END,
				ImageURL = @ImageURL
		WHERE UserID = @UserID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[Users] (
			UserID,
			UserName,
			Media,
			Follows,
			Followers,
			[Private],
			Code,
			Token,
			LocalToken,
			Activated,
			InvitedByUserID,
			ImageURL
		)
		VALUES (
			@UserID,
			@UserName,
			0,
			0,
			0,
			0,
			@Code,
			@Token,
			@LocalToken,
			1,
			@InvitedByUserID,
			@ImageURL
		)
	END
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[P_GetUsers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[P_GetUsers]
GO

CREATE PROCEDURE [dbo].[P_GetUsers]
	@CurrentUserID	varchar(50),
	@UserIDs		StringTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT	U.*,
			A.Alias
	FROM @UserIDs AS IDs
		INNER JOIN [dbo].[Users] AS U
		ON U.UserID = IDs.Value
		LEFT JOIN [dbo].[Alias] AS A
		ON @CurrentUserID IS NOT NULL AND 
			A.UserID = @CurrentUserID AND A.TargetUserID = IDs.Value
	ORDER BY IDs.SequenceNumber ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetUsers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetUsers]
GO

CREATE PROCEDURE [dbo].[GetUsers]
	@CurrentUserID	varchar(50),
	@UserIDs		KeyLessStringTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UIDs StringTableType
	
	INSERT INTO @UIDs (Value)
	SELECT U.Value
	FROM @UserIDs AS U
	
	EXEC [dbo].[P_GetUsers] @CurrentUserID, @UIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetLocalTokenOwner]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetLocalTokenOwner]
GO

CREATE PROCEDURE [dbo].[GetLocalTokenOwner]
	@Token		varchar(100)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UIDs StringTableType
	
	INSERT INTO @UIDs (Value)
	SELECT U.UserID
	FROM [dbo].[Users] AS U
	WHERE U.LocalToken = @Token
	
	EXEC [dbo].[P_GetUsers] NULL, @UIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetActivatedUsers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetActivatedUsers]
GO

CREATE PROCEDURE [dbo].[GetActivatedUsers]
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UIDs StringTableType
	
	INSERT INTO @UIDs (Value)
	SELECT UserID
	FROM [dbo].[Users]
	WHERE Activated = 1 AND Code IS NOT NULL AND Token IS NOT NULL
	
	EXEC [dbo].[P_GetUsers] NULL, @UIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[LogOut]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[LogOut]
GO

CREATE PROCEDURE [dbo].[LogOut]
	@UserID				varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Users]
		SET Code = NULL,
			Token = NULL
	WHERE UserID = @UserID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[IsActivatedUser]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[IsActivatedUser]
GO

CREATE PROCEDURE [dbo].[IsActivatedUser]
	@UserID		varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT TOP(1) CAST(1 as int)
	FROM [dbo].[Users]
	WHERE UserID = @UserID AND Activated = 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[LockUser]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[LockUser]
GO

CREATE PROCEDURE [dbo].[LockUser]
	@UserID		varchar(50),
	@Until		datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Users]
		SET LockUntil = @Until
	WHERE UserID = @UserID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UserUnlockTime]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UserUnlockTime]
GO

CREATE PROCEDURE [dbo].[UserUnlockTime]
	@UserID		varchar(50),
	@Now		datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Users]
		SET LockUntil = NULL
	WHERE UserID = @UserID AND LockUntil < @Now
	
	SELECT TOP(1) LockUntil
	FROM [dbo].[Users]
	WHERE UserID = @UserID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UpdateMedia]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UpdateMedia]
GO

CREATE PROCEDURE [dbo].[UpdateMedia]
	@Items	MediaTableType readonly,
	@Tags	MediaTagTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE M
		SET [Type] = I.[Type],
			CreationTime = I.CreationTime,
			Likes = I.Likes,
			Comments = I.Comments,
			LocationID = I.LocationID,
			LocationName = I.LocationName,
			Latitude = I.Latitude,
			Longitude = I.Longitude,
			Caption = I.Caption,
			ImageURL = I.ImageURL,
			VideoURL = I.VideoURL
	FROM @Items AS I
		INNER JOIN [dbo].[Media] AS M
		ON M.MediaID = I.MediaID
		
		
	INSERT INTO [dbo].[Media](
		MediaID, UserID, [Type], CreationTime, Likes, Comments, LocationID, 
		LocationName, Latitude, Longitude, Caption, ImageURL, VideoURL, Hidden
	)
	SELECT	I.MediaID, I.UserID, I.[Type], I.CreationTime, I.Likes, I.Comments,
			I.LocationID, I.LocationName, I.Latitude, I.Longitude, 
			I.Caption, I.ImageURL, I.VideoURL, 0
	FROM @Items AS I
		LEFT JOIN [dbo].[Media] AS M
		ON M.MediaID = I.MediaID
	WHERE M.MediaID IS NULL
	
	INSERT INTO [dbo].[Tags] (Name, MediaCount)
	SELECT I.Name, I.MediaCount
	FROM (
			SELECT Name, MAX(ISNULL(MediaCount, 0)) AS MediaCount
			FROM @Tags
			GROUP BY Name
		) AS I
		LEFT JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
	WHERE T.TagID IS NULL
	
	DELETE [dbo].[MediaTags]
	FROM @Items AS I
		INNER JOIN [dbo].[MediaTags] AS M
		ON M.MediaID = I.MediaID
		
	INSERT INTO [dbo].[MediaTags] (MediaID, TagID)
	SELECT DISTINCT M.MediaID, T.TagID
	FROM @Tags AS I
		INNER JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
		INNER JOIN [dbo].[Media] AS M
		ON M.MediaID = I.MediaID
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UpdatePublicMedia]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UpdatePublicMedia]
GO

CREATE PROCEDURE [dbo].[UpdatePublicMedia]
	@Items	MediaTableType readonly,
	@Tags	MediaTagTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE M
		SET [Type] = I.[Type],
			CreationTime = I.CreationTime,
			Likes = I.Likes,
			Comments = I.Comments,
			LocationID = I.LocationID,
			LocationName = I.LocationName,
			Latitude = I.Latitude,
			Longitude = I.Longitude,
			Caption = I.Caption,
			ImageURL = I.ImageURL,
			VideoURL = I.VideoURL
	FROM @Items AS I
		INNER JOIN [dbo].[PublicMedia] AS M
		ON M.MediaID = I.MediaID
		
		
	INSERT INTO [dbo].[PublicMedia](
		MediaID, UserID, [Type], CreationTime, Likes, Comments, LocationID, 
		LocationName, Latitude, Longitude, Caption, ImageURL, VideoURL
	)
	SELECT	I.MediaID, I.UserID, I.[Type], I.CreationTime, I.Likes, I.Comments,
			I.LocationID, I.LocationName, I.Latitude, I.Longitude, 
			I.Caption, I.ImageURL, I.VideoURL
	FROM @Items AS I
		LEFT JOIN [dbo].[PublicMedia] AS M
		ON M.MediaID = I.MediaID
	WHERE M.MediaID IS NULL
	
	INSERT INTO [dbo].[Tags] (Name, MediaCount)
	SELECT I.Name, I.MediaCount
	FROM (
			SELECT Name, MAX(ISNULL(MediaCount, 0)) AS MediaCount
			FROM @Tags
			GROUP BY Name
		) AS I
		LEFT JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
	WHERE T.TagID IS NULL
	
	DELETE [dbo].[PublicMediaTags]
	FROM @Items AS I
		INNER JOIN [dbo].[PublicMediaTags] AS M
		ON M.MediaID = I.MediaID
		
	INSERT INTO [dbo].[PublicMediaTags] (MediaID, TagID)
	SELECT DISTINCT M.MediaID, T.TagID
	FROM @Tags AS I
		INNER JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
		INNER JOIN [dbo].[PublicMedia] AS M
		ON M.MediaID = I.MediaID
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UpdateLocationMedia]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UpdateLocationMedia]
GO

CREATE PROCEDURE [dbo].[UpdateLocationMedia]
	@Items	BigintStringTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[LocationMedia](LocationID, MediaID)
	SELECT	I.FirstValue, I.SecondValue
	FROM @Items AS I
		LEFT JOIN [dbo].[LocationMedia] AS M
		ON M.LocationID = I.FirstValue AND M.MediaID = I.SecondValue
	WHERE M.LocationID IS NULL
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UserMedia]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UserMedia]
GO

CREATE PROCEDURE [dbo].[UserMedia]
	@UserID			varchar(50),
	@Count			int,
	@LowerBoundary	int,
	@Asc			bit
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF @Asc = 1 BEGIN
		SELECT TOP(ISNULL(@Count, 100)) *
		FROM (
				SELECT	ROW_NUMBER() OVER(ORDER BY M.CreationTime ASC, M.MediaID DESC) AS RowNumber,
						M.*
				FROM [dbo].[Media] AS M
				WHERE M.UserID = @UserID AND M.Hidden = 0
			) AS X
		WHERE X.RowNumber >= ISNULL(@LowerBoundary, 0)	
	END
	ELSE BEGIN
		SELECT TOP(ISNULL(@Count, 100)) *
		FROM (
				SELECT	ROW_NUMBER() OVER(ORDER BY M.CreationTime DESC, M.MediaID ASC) AS RowNumber,
						M.*
				FROM [dbo].[Media] AS M
				WHERE M.UserID = @UserID AND M.Hidden = 0
			) AS X
		WHERE X.RowNumber >= ISNULL(@LowerBoundary, 0)	
	END
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetMediaTags]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetMediaTags]
GO

CREATE PROCEDURE [dbo].[GetMediaTags]
	@MediaIDs	KeyLessStringTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @MIDs StringTableType
	
	INSERT INTO @MIDs (Value)
	SELECT Value
	FROM @MediaIDs
	
	SELECT MT.MediaID, T.Name
	FROM @MIDs AS IDs
		INNER JOIN [dbo].[MediaTags] AS MT
		ON MT.MediaID = IDs.Value
		INNER JOIN [dbo].[Tags] AS T
		ON T.TagID = MT.TagID
	ORDER BY IDs.SequenceNumber ASC, T.TagID ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[AddMediaFans]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[AddMediaFans]
GO

CREATE PROCEDURE [dbo].[AddMediaFans]
	@Fans	MediaFanTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE F
		SET Liked = CASE WHEN F.Liked = 1 THEN F.Liked ELSE ISNULL(M.Liked, 0) END,
			Commented = CASE WHEN F.Commented = 1 THEN F.Commented ELSE ISNULL(M.Commented, 0) END
	FROM @Fans AS M
		INNER JOIN [dbo].[MediaFans] AS F
		ON F.MediaID = M.MediaID AND F.UserID = M.UserID
		
	INSERT INTO [dbo].[MediaFans] (MediaID, UserID, Liked, Commented)
	SELECT M.MediaID, M.UserID, ISNULL(M.Liked, 0), ISNULL(M.Commented, 0)
	FROM @Fans AS M
		LEFT JOIN [dbo].[MediaFans] AS F
		ON F.MediaID = M.MediaID AND F.UserID = M.UserID
	WHERE F.MediaID IS NULL
		
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UpdateTags]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UpdateTags]
GO

CREATE PROCEDURE [dbo].[UpdateTags]
	@Tags	MediaTagTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Tags]
		SET MediaCount = X.MediaCount
	FROM @Tags AS X
		INNER JOIN [dbo].[Tags] AS T
		ON T.TagID = X.TagID
		
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[MediaSendersOfTag]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[MediaSendersOfTag]
GO

CREATE PROCEDURE [dbo].[MediaSendersOfTag]
	@CurrentUserID	varchar(50),
	@TagID			bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UserIDs StringTableType
	
	INSERT INTO @UserIDs (Value)
	SELECT DISTINCT M.UserID
	FROM [dbo].[MediaTags] AS MT
		INNER JOIN [dbo].[Media] AS M
		ON M.MediaID = MT.MediaID
		LEFT JOIN [dbo].[Followers] AS F
		ON F.UserID = M.UserID AND F.FollowerUserID = @CurrentUserID
	WHERE MT.TagID = @TagID AND F.UserID IS NULL AND
		M.UserID <> @CurrentUserID
	
	EXEC [dbo].[P_GetUsers] @CurrentUserID, @UserIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[FansOfTag]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[FansOfTag]
GO

CREATE PROCEDURE [dbo].[FansOfTag]
	@CurrentUserID	varchar(50),
	@TagID			bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UserIDs StringTableType
	
	INSERT INTO @UserIDs (Value)
	SELECT DISTINCT M.UserID
	FROM [dbo].[MediaTags] AS MT
		INNER JOIN [dbo].[MediaFans] AS M
		ON M.MediaID = MT.MediaID
		LEFT JOIN [dbo].[Followers] AS F
		ON F.UserID = M.UserID AND F.FollowerUserID = @CurrentUserID
	WHERE MT.TagID = @TagID AND F.UserID IS NULL AND
		M.UserID <> @CurrentUserID
	
	EXEC [dbo].[P_GetUsers] @CurrentUserID, @UserIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[FindFavoriteTags]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[FindFavoriteTags]
GO

CREATE PROCEDURE [dbo].[FindFavoriteTags]
	@UserID	varchar(50),
	@Count	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT TOP(ISNULL(@Count, 20)) *
	FROM (
			SELECT	T.TagID,
					MAX(T.Name) AS Name,
					COUNT(DISTINCT MT.MediaID) AS MediaCount
			FROM [dbo].[MediaFans] as F
				INNER JOIN [dbo].[MediaTags] AS MT
				ON MT.MediaID = F.MediaID
				INNER JOIN [dbo].[Tags] AS T
				ON T.TagID = MT.TagID
				LEFT JOIN [dbo].[BookmarkedTags] AS BT
				ON BT.UserID = F.UserID AND BT.TagID = T.TagID AND BT.Hidden = 0
			WHERE F.UserID = @UserID AND F.Liked = 1 AND BT.TagID IS NULL
			GROUP BY T.TagID
		) AS X
	ORDER BY X.MediaCount DESC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[FindPagesToBookmark]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[FindPagesToBookmark]
GO

CREATE PROCEDURE [dbo].[FindPagesToBookmark]
	@UserID	varchar(50),
	@Count	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UIDs StringTableType
	
	INSERT INTO @UIDs (Value)
	SELECT TOP(ISNULL(@Count, 20)) X.UserID
	FROM (
			SELECT M.UserID, COUNT(DISTINCT M.MediaID) AS MediaCount
			FROM [dbo].[BookmarkedTags] AS BT
				INNER JOIN [dbo].[MediaTags] AS MT
				ON MT.TagID = BT.TagID
				INNER JOIN [dbo].[Media] AS M
				ON M.MediaID = MT.MediaID
				LEFT JOIN [dbo].[BookmarkedUsers] AS BU
				ON BU.UserID = BT.UserID AND BU.TargetUserID = M.UserID AND BU.Hidden = 0
			WHERE BT.UserID = @UserID AND BT.Hidden = 0 AND 
				BU.UserID IS NULL AND M.UserID <> @UserID
			GROUP BY M.UserID
		) AS X
	ORDER BY X.MediaCount DESC
	
	EXEC [dbo].[P_GetUsers] @UserID, @UIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SuggestUsersToFollow]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SuggestUsersToFollow]
GO

CREATE PROCEDURE [dbo].[SuggestUsersToFollow]
	@UserID	varchar(50),
	@Count	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UIDs StringTableType

	INSERT INTO @UIDs (Value)
	SELECT TOP(ISNULL(@Count, 20)) U.UserID
	FROM (
			SELECT	X.UserID,
					SUM(X.[Rank]) AS [Rank]
			FROM (
					SELECT	M.UserID, 
							COUNT(DISTINCT M.MediaID) AS [Rank]
					FROM [dbo].[BookmarkedTags] AS BT
						INNER JOIN [dbo].[MediaTags] AS MT
						ON MT.TagID = BT.TagID
						INNER JOIN [dbo].[MediaFans] AS M
						ON M.MediaID = MT.MediaID
					WHERE BT.UserID = @UserID AND BT.Hidden = 0 AND M.UserID <> @UserID
					GROUP BY M.UserID

					UNION ALL

					SELECT	M.UserID, 
							COUNT(DISTINCT M.MediaID) AS [Rank]
					FROM [dbo].[BookmarkedTags] AS BT
						INNER JOIN [dbo].[MediaTags] AS MT
						ON MT.TagID = BT.TagID
						INNER JOIN [dbo].[Media] AS M
						ON M.MediaID = MT.MediaID
					WHERE BT.UserID = @UserID AND BT.Hidden = 0 AND M.UserID <> @UserID
					GROUP BY M.UserID

					UNION ALL

					SELECT DISTINCT 
							FS.UserID,
							1 AS [Rank]
					FROM [dbo].[BookmarkedLocations] AS BL
						INNER JOIN [dbo].[FollowSuggestions] AS FS
						ON FS.BookmarkedLocationID = BL.ID
					WHERE BL.UserID = @UserID AND FS.UserID <> @UserID
				) AS X
			GROUP BY X.UserID
		) AS U
		LEFT JOIN [dbo].[Followers] AS F
		ON F.UserID = U.UserID AND F.FollowerUserID = @UserID
	WHERE F.UserID IS NULL
	ORDER BY U.[Rank] DESC

	EXEC [dbo].[P_GetUsers] @UserID, @UIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[MediaSendersOfLocation]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[MediaSendersOfLocation]
GO

CREATE PROCEDURE [dbo].[MediaSendersOfLocation]
	@CurrentUserID	varchar(50),
	@LocationID		bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UserIDs StringTableType
	
	INSERT INTO @UserIDs (Value)
	SELECT DISTINCT FS.UserID
	FROM [dbo].[FollowSuggestions] AS FS
		LEFT JOIN [dbo].[Followers] AS F
		ON F.UserID = FS.UserID AND F.FollowerUserID = @CurrentUserID
	WHERE FS.BookmarkedLocationID = @LocationID AND F.UserID IS NULL AND
		FS.UserID <> @CurrentUserID
	
	EXEC [dbo].[P_GetUsers] @CurrentUserID, @UserIDs
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[AddFollowers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[AddFollowers]
GO

CREATE PROCEDURE [dbo].[AddFollowers]
	@Followers	StringPairTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[Followers] (UserID, FollowerUserID)
	SELECT DISTINCT U.FirstValue, U.SecondValue
	FROM @Followers AS U
		LEFT JOIN [dbo].[Followers] AS F
		ON F.UserID = U.FirstValue AND F.FollowerUserID = U.SecondValue
	WHERE F.UserID IS NULL AND (U.FirstValue <> U.SecondValue)
	
	DELETE S
	FROM @Followers AS F
		INNER JOIN [dbo].[FollowSuggestions] AS S
		ON (S.UserID = F.FirstValue AND S.SuggestedUserID = F.SecondValue) OR
			 (S.UserID = F.SecondValue AND S.SuggestedUserID = F.FirstValue)
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[AddFollowSuggestions]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[AddFollowSuggestions]
GO

CREATE PROCEDURE [dbo].[AddFollowSuggestions]
	@Suggestions	FollowSuggestionTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[FollowSuggestions] (
		UserID, SuggestedUserID, BookmarkedLocationID
	)
	SELECT DISTINCT S.UserID, S.SuggestedUserID, S.LID
	FROM (
			SELECT X.UserID, X.SuggestedUserID, MAX(X.BookmarkedLocationID) AS LID
			FROM @Suggestions AS X
			GROUP BY X.UserID, X.SuggestedUserID
		) AS S
		LEFT JOIN [dbo].[FollowSuggestions] AS FS
		ON FS.UserID = S.UserID AND FS.SuggestedUserID = S.SuggestedUserID
		LEFT JOIN [dbo].[Followers] AS F
		ON (F.UserID = S.UserID AND F.FollowerUserID = S.SuggestedUserID) OR
			(F.UserID = S.SuggestedUserID AND F.FollowerUserID = S.UserID)
	WHERE FS.UserID IS NULL AND F.UserID IS NULL AND
		(S.UserID <> S.SuggestedUserID)
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[BookmarkUser]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[BookmarkUser]
GO

CREATE PROCEDURE [dbo].[BookmarkUser]
	@UserID			varchar(50),
	@TargetUserID	varchar(50),
	@BookmarkTime	datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF EXISTS (
		SELECT TOP(1) TargetUserID 
		FROM [dbo].[BookmarkedUsers] 
		WHERE UserID = @UserID AND TargetUserID = @TargetUserID
	) BEGIN
		UPDATE [dbo].[BookmarkedUsers]
			SET Hidden = 0,
				BookmarkTime = @BookmarkTime
		WHERE UserID = @UserID AND TargetUserID = @TargetUserID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[BookmarkedUsers] (
			UserID,
			TargetUserID,
			BookmarkTime,
			Hidden
		)
		VALUES (
			@UserID,
			@TargetUserID,
			@BookmarkTime,
			0
		)
	END
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveBookmarkedUser]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveBookmarkedUser]
GO

CREATE PROCEDURE [dbo].[RemoveBookmarkedUser]
	@UserID			varchar(50),
	@TargetUserID	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON

	UPDATE [dbo].[BookmarkedUsers]
		SET Hidden = 1
	WHERE UserID = @UserID AND TargetUserID = @TargetUserID

	SELECT @@ROWCOUNT + 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetBookmarkedUsers]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetBookmarkedUsers]
GO

CREATE PROCEDURE [dbo].[GetBookmarkedUsers]
	@UserID			varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT	B.UserID AS UserID, 
			B.TargetUserID AS BookmarkedUserID, 
			A.Alias AS Alias
	FROM [dbo].[BookmarkedUsers] AS B
		LEFT JOIN [dbo].[Alias] AS A
		ON A.UserID = B.UserID AND A.TargetUserID = B.TargetUserID
	WHERE (@UserID IS NULL OR B.UserID = @UserID) AND B.Hidden = 0
	ORDER BY B.BookmarkTime ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SetAlias]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SetAlias]
GO

CREATE PROCEDURE [dbo].[SetAlias]
	@UserID			varchar(50),
	@TargetUserID	varchar(50),
	@Alias			nvarchar(100)	
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF EXISTS (
		SELECT TOP(1) TargetUserID 
		FROM [dbo].[Alias] 
		WHERE UserID = @UserID AND TargetUserID = @TargetUserID
	) BEGIN
		UPDATE [dbo].[Alias]
			SET Alias = @Alias
		WHERE UserID = @UserID AND TargetUserID = @TargetUserID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[Alias] (
			UserID,
			TargetUserID,
			Alias
		)
		VALUES (
			@UserID,
			@TargetUserID,
			@Alias
		)
	END
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveAlias]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveAlias]
GO

CREATE PROCEDURE [dbo].[RemoveAlias]
	@UserID			varchar(50),
	@TargetUserID	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DELETE [dbo].[Alias]
	WHERE UserID = @UserID AND TargetUserID = @TargetUserID
	
	SELECT @@ROWCOUNT + 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[BookmarkTag]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[BookmarkTag]
GO

CREATE PROCEDURE [dbo].[BookmarkTag]
	@UserID			varchar(50),
	@TagName		nvarchar(200),
	@BookmarkTime	datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @TagID bigint = (
		SELECT TOP(1) TagID 
		FROM [dbo].[Tags] 
		WHERE Name = @TagName
	)
	
	IF @TagID IS NULL BEGIN
		INSERT INTO [dbo].[Tags] (Name, MediaCount)
		VALUES (@TagName, 0)
		
		SET @TagID = @@IDENTITY
	END
	
	IF EXISTS (
		SELECT TOP(1) TagID 
		FROM [dbo].[BookmarkedTags] 
		WHERE UserID = @UserID AND TagID = @TagID
	) BEGIN
		UPDATE [dbo].[BookmarkedTags]
			SET Hidden = 0,
				BookmarkTime = @BookmarkTime
		WHERE UserID = @UserID AND TagID = @TagID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[BookmarkedTags] (
			UserID,
			TagID,
			BookmarkTime,
			Hidden
		)
		VALUES (
			@UserID,
			@TagID,
			@BookmarkTime,
			0
		)
	END
	
	IF @@ROWCOUNT > 0 SELECT @TagID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveBookmarkedTag]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveBookmarkedTag]
GO

CREATE PROCEDURE [dbo].[RemoveBookmarkedTag]
	@UserID		varchar(50),
	@TagID		bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON

	UPDATE [dbo].[BookmarkedTags]
		SET Hidden = 1
	WHERE UserID = @UserID AND TagID = @TagID

	SELECT @@ROWCOUNT + 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetBookmarkedTags]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetBookmarkedTags]
GO

CREATE PROCEDURE [dbo].[GetBookmarkedTags]
	@UserID			varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT	B.UserID,
			T.*
	FROM [dbo].[BookmarkedTags] AS B
		INNER JOIN [dbo].[Tags] AS T
		ON T.TagID = B.TagID
	WHERE (@UserID IS NULL OR B.UserID = @UserID) AND B.Hidden = 0
	ORDER BY B.BookmarkTime ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[BookmarkLocation]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[BookmarkLocation]
GO

CREATE PROCEDURE [dbo].[BookmarkLocation]
	@ID			bigint,
	@UserID		varchar(50),
	@Name		nvarchar(1000),
	@Alias		nvarchar(1000),
	@Latitude	float,
	@Longitude	float,
	@Radius		int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF ISNULL(@ID, 0) > 0 BEGIN
		UPDATE [dbo].[BookmarkedLocations]
			SET Name = @Name,
				Alias = @Alias,
				Latitude = @Latitude,
				Longitude = @Longitude,
				Radius = @Radius
		WHERE ID = @ID AND UserID = @UserID
		
		IF @@ROWCOUNT > 0 SELECT @ID
		ELSE SELECT NULL
	END
	ELSE BEGIN
		INSERT INTO [dbo].[BookmarkedLocations](
			UserID,
			Name,
			Alias,
			Latitude,
			Longitude,
			Radius
		)
		VALUES (
			@UserID,
			@Name,
			@Alias,
			@Latitude,
			@Longitude,
			@Radius
		)
		
		SELECT @@IDENTITY
	END
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveBookmarkedLocation]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveBookmarkedLocation]
GO

CREATE PROCEDURE [dbo].[RemoveBookmarkedLocation]
	@ID		bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DELETE [dbo].[FollowSuggestions]
	WHERE BookmarkedLocationID = @ID
	
	DELETE [dbo].[BookmarkedLocations]
	WHERE ID = @ID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetBookmarkedLocations]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetBookmarkedLocations]
GO

CREATE PROCEDURE [dbo].[GetBookmarkedLocations]
	@UserID		varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT *
	FROM [dbo].[BookmarkedLocations]
	WHERE (@UserID IS NULL OR UserID = @UserID)
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[AddUserTrendItem]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[AddUserTrendItem]
GO

CREATE PROCEDURE [dbo].[AddUserTrendItem]
	@UserID		varchar(50),
	@Time		datetime,
	@Media		int,
	@Follows	int,
	@Followers	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[UserTrends] (UserID, [Time], Media, Follows, Followers)
	VALUES (@UserID, @Time, @Media, @Follows, @Followers)
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetUserTrendItems]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetUserTrendItems]
GO

CREATE PROCEDURE [dbo].[GetUserTrendItems]
	@UserID		varchar(50),
	@Count		int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT TOP(ISNULL(@Count, 1)) *
	FROM [dbo].[UserTrends] AS T
	WHERE T.UserID = @UserID
	ORDER BY T.[Time] DESC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetCategories]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetCategories]
GO

CREATE PROCEDURE [dbo].[GetCategories]
	@UserID		varchar(50),
	@CategoryID	bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT *
	FROM [dbo].[Categories]
	WHERE (@UserID IS NULL AND @CategoryID IS NULL) OR 
		UserID = @UserID OR ID = @CategoryID
	ORDER BY ID ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetCategoryTags]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetCategoryTags]
GO

CREATE PROCEDURE [dbo].[GetCategoryTags]
	@UserID		varchar(50),
	@CategoryID	bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT C.ID AS CategoryID, T.*
	FROM [dbo].[Categories] AS C
		INNER JOIN [dbo].[CategoryTags] AS CT
		ON CT.CategoryID = C.ID
		INNER JOIN [dbo].[Tags] AS T
		ON T.TagID = CT.TagID
	WHERE (@UserID IS NULL AND @CategoryID IS NULL) OR 
		C.UserID = @UserID OR C.ID = @CategoryID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[GetCategoryLocations]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[GetCategoryLocations]
GO

CREATE PROCEDURE [dbo].[GetCategoryLocations]
	@UserID		varchar(50),
	@CategoryID	bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT C.ID AS CategoryID, L.*
	FROM [dbo].[Categories] AS C
		INNER JOIN [dbo].[CategoryLocations] AS CL
		ON CL.CategoryID = C.ID
		INNER JOIN [dbo].[BookmarkedLocations] AS L
		ON L.ID = CL.LocationID
	WHERE (@UserID IS NULL AND @CategoryID IS NULL) OR 
		C.UserID = @UserID OR C.ID = @CategoryID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SaveCategory]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SaveCategory]
GO

CREATE PROCEDURE [dbo].[SaveCategory]
	@UserID			varchar(50),
	@ID				bigint,
	@Name			nvarchar(200),
	@LikesMin		int,
	@SimilarTags	bit,
	@Tags			MediaTagTableType readonly,
	@Locations		LocationTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF @ID IS NULL BEGIN
		INSERT INTO [dbo].[Categories] (UserID, Name, LikesMin, SimilarTags)
		VALUES (@UserID, @Name, @LikesMin, @SimilarTags)
		
		SET @ID = @@IDENTITY
	END
	ELSE BEGIN
		UPDATE [dbo].[Categories]
			SET Name = @Name,
				LikesMin = @LikesMin,
				SimilarTags = @SimilarTags
		WHERE ID = @ID
		
		IF @@ROWCOUNT <= 0 BEGIN
			SELECT -1
			RETURN
		END
	END
	
	-- Update Tags
	INSERT INTO [dbo].[Tags] (Name, MediaCount)
	SELECT I.Name, I.MediaCount
	FROM (
			SELECT Name, MAX(ISNULL(MediaCount, 0)) AS MediaCount
			FROM @Tags
			GROUP BY Name
		) AS I
		LEFT JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
	WHERE T.TagID IS NULL
	
	DELETE [dbo].[CategoryTags]
	WHERE CategoryID = @ID
		
	INSERT INTO [dbo].[CategoryTags] (CategoryID, TagID)
	SELECT DISTINCT @ID, T.TagID
	FROM @Tags AS I
		INNER JOIN [dbo].[Tags] AS T
		ON T.Name = I.Name
	-- end of Update Tags
	
	-- Update Locations
	DELETE L
	FROM [dbo].[CategoryLocations] AS C
		INNER JOIN [dbo].[BookmarkedLocations] AS L
		ON L.ID = C.LocationID
		LEFT JOIN @Locations AS Loc
		ON Loc.ID = L.ID
	WHERE C.CategoryID = @ID AND Loc.ID IS NULL
	
	DELETE [dbo].[CategoryLocations]
	FROM [dbo].[CategoryLocations] AS C
		LEFT JOIN @Locations AS Loc
		ON Loc.ID = C.LocationID
	WHERE C.CategoryID = @ID AND Loc.ID IS NULL
	
	DECLARE @IDs TABLE (ID bigint)
	
	INSERT INTO [dbo].[BookmarkedLocations] (
		UserID, Name, Alias, Latitude, Longitude, Radius
	)
	OUTPUT inserted.ID INTO @IDs (ID)
	SELECT @UserID, L.Name, L.Alias, L.Latitude, L.Longitude, L.Radius
	FROM @Locations AS L
	WHERE L.ID IS NULL
	
	INSERT INTO [dbo].[CategoryLocations] (CategoryID, LocationID)
	SELECT @ID, I.ID
	FROM @IDs AS I
	-- end of Update Locations
	
	SELECT @ID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveCategory]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveCategory]
GO

CREATE PROCEDURE [dbo].[RemoveCategory]
	@ID		bigint
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DELETE M
	FROM [dbo].[CategoryLocations] AS C
		INNER JOIN [dbo].[LocationMedia] AS M
		ON M.LocationID = C.LocationID
	WHERE C.CategoryID = @ID
	
	DELETE B
	FROM [dbo].[CategoryLocations] AS C
		INNER JOIN [dbo].[BookmarkedLocations] AS B
		ON B.ID = C.LocationID
	WHERE C.CategoryID = @ID
	
	DELETE [dbo].[CategoryLocations]
	WHERE CategoryID = @ID
	
	DELETE [dbo].[CategoryTags]
	WHERE CategoryID = @ID
	
	DELETE [dbo].[Categories]
	WHERE ID = @ID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[CategoryMedia]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[CategoryMedia]
GO

CREATE PROCEDURE [dbo].[CategoryMedia]
	@CategoryID		bigint,
	@Count			int,
	@LowerBoundary	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @LikesMin int = ISNULL((
		SELECT TOP(1) LikesMin
		FROM [dbo].[Categories]
		WHERE ID = @CategoryID
	), 0)

	SELECT TOP(ISNULL(@Count, 20)) Media.*
	FROM (
			SELECT	ROW_NUMBER() OVER (ORDER BY MAX(M.CreationTime) DESC, M.MediaID DESC) AS RowNumber,
					M.MediaID
			FROM (
					SELECT M.MediaID, M.CreationTime
					FROM [dbo].[CategoryTags] AS CT
						INNER JOIN [dbo].[PublicMediaTags] AS PMT
						ON PMT.TagID = CT.TagID
						INNER JOIN [dbo].[PublicMedia] AS M
						ON M.MediaID = PMT.MediaID AND 
							ISNULL(M.Likes, 0) >= ISNULL(@LikesMin, 0)
					WHERE CT.CategoryID = @CategoryID

					UNION ALL 

					SELECT M.MediaID, M.CreationTime
					FROM [dbo].[CategoryLocations] AS CL
						INNER JOIN [dbo].[LocationMedia] AS LM
						ON LM.LocationID = CL.LocationID
						INNER JOIN [dbo].[PublicMedia] AS M
						ON M.MediaID = LM.MediaID AND 
							ISNULL(M.Likes, 0) >= ISNULL(@LikesMin, 0)
					WHERE CL.CategoryID = @CategoryID
				) AS M
			GROUP BY M.MediaID
		) AS X
		INNER JOIN [dbo].[PublicMedia] AS Media
		ON Media.MediaID = X.MediaID
	WHERE X.RowNumber >= ISNULL(@LowerBoundary, 0)
	ORDER BY X.RowNumber ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[HourlyInsight]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[HourlyInsight]
GO

CREATE PROCEDURE [dbo].[HourlyInsight]
	@UserID			varchar(50),
	@TimezoneOffset int,
	@DayOfWeekFrom	int,
	@DayOfWeekTo	int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SET @TimezoneOffset = -1 * ISNULL(@TimezoneOffset, 0)
	IF NOT (ISNULL(@DayOfWeekFrom, 1) BETWEEN 1 AND 7) SET @DayOfWeekFrom = NULL
	IF NOT (ISNULL(@DayOfWeekTo, 1) BETWEEN 1 AND 7) SET @DayOfWeekTo = NULL
	
	SELECT	X.[Hour], 
			COUNT(X.MediaID) AS MediaCount, 
			AVG(CAST(X.Likes AS float)) AS LikesCountAvg, 
			AVG(CAST(X.Comments AS float)) AS CommentsCountAvg
	FROM (
			SELECT	M.MediaID,
					DATEPART(HOUR, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [Hour],
					DATEPART(DW, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [DayOfWeek],
					M.Likes,
					M.Comments
			FROM [dbo].[Media] AS M
			WHERE M.UserID = @UserID
		) AS X
	WHERE (
			@DayOfWeekFrom IS NOT NULL AND @DayOfWeekTo IS NOT NULL AND
			@DayOfWeekFrom > @DayOfWeekTo AND (
				X.[DayOfWeek] >= @DayOfWeekFrom OR X.[DayOfWeek] <= @DayOfWeekTo
			)
		) OR (
			(
				@DayOfWeekFrom IS NULL OR @DayOfWeekTo IS NULL OR
				@DayOfWeekFrom <= @DayOfWeekTo
			) AND (
				(@DayOfWeekFrom IS NULL OR X.[DayOfWeek] >= @DayOfWeekFrom) AND
				(@DayOfWeekTo IS NULL OR X.[DayOfWeek] <= @DayOfWeekTo)
			)
		)
	GROUP BY X.[Hour]
	ORDER BY X.[Hour] ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[DailyInsight]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[DailyInsight]
GO

CREATE PROCEDURE [dbo].[DailyInsight]
	@UserID			varchar(50),
	@TimezoneOffset int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SET @TimezoneOffset = -1 * ISNULL(@TimezoneOffset, 0)
	
	SELECT	X.[DayOfWeek], 
			COUNT(X.MediaID) AS MediaCount, 
			AVG(CAST(X.Likes AS float)) AS LikesCountAvg, 
			AVG(CAST(X.Comments AS float)) AS CommentsCountAvg
	FROM (
			SELECT	M.MediaID,
					DATEPART(HOUR, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [Hour],
					DATEPART(DW, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [DayOfWeek],
					M.Likes,
					M.Comments
			FROM [dbo].[Media] AS M
			WHERE M.UserID = @UserID
		) AS X
	GROUP BY X.[DayOfWeek]
	ORDER BY X.[DayOfWeek] ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[MonthlyTrend]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[MonthlyTrend]
GO

CREATE PROCEDURE [dbo].[MonthlyTrend]
	@UserID			varchar(50),
	@TimezoneOffset int,
	@Count			int
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SET @TimezoneOffset = -1 * ISNULL(@TimezoneOffset, 0)
	
	SELECT *
	FROM (
			SELECT TOP(ISNULL(@Count, 100)) 
				X.[Year],
				X.[Month], 
				COUNT(X.MediaID) AS MediaCount, 
				AVG(CAST(X.Likes AS float)) AS LikesCountAvg, 
				AVG(CAST(X.Comments AS float)) AS CommentsCountAvg
			FROM (
					SELECT	M.MediaID,
							DATEPART(YEAR, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [Year],
							DATEPART(MONTH, DATEADD(MINUTE, @TimezoneOffset, M.CreationTime)) AS [Month],
							M.Likes,
							M.Comments
					FROM [dbo].[Media] AS M
					WHERE M.UserID = @UserID
				) AS X
			GROUP BY X.[Year], X.[Month]
			ORDER BY X.[Year] DESC, X.[Month] DESC
		) AS D
	ORDER BY D.[Year] ASC, D.[Month] ASC
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[TagsInsight]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[TagsInsight]
GO

CREATE PROCEDURE [dbo].[TagsInsight]
	@UserID			varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT	MAX(T.Name) AS Name, 
			COUNT(M.MediaID) AS MediaCount, 
			AVG(CAST(M.Likes AS float)) AS LikesCountAvg,
			AVG(CAST(M.Comments AS float)) AS CommentsCountAvg
	FROM [dbo].[Media] AS M
		INNER JOIN [dbo].[MediaTags] AS MT
		ON MT.MediaID = M.MediaID
		INNER JOIN [dbo].[Tags] AS T
		ON T.TagID = MT.TagID
	WHERE M.UserID = @UserID
	GROUP BY MT.TagID
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SubmitFace]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SubmitFace]
GO

CREATE PROCEDURE [dbo].[SubmitFace]
	@MediaID	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF EXISTS(
		SELECT TOP(1) *
		FROM [dbo].[Faces]
		WHERE MediaID = @MediaID
	) BEGIN 
		UPDATE [dbo].[Faces]
			SET Removed = 0
		WHERE MediaID = @MediaID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[Faces] (MediaID, [Level], Reported, Removed)
		VALUES (@MediaID, 0, 0, 0)
	END
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[RemoveSubmitedFace]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[RemoveSubmitedFace]
GO

CREATE PROCEDURE [dbo].[RemoveSubmitedFace]
	@MediaID	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Faces]
		SET Removed = 1
	WHERE MediaID = @MediaID
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[ComparedFaces]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[ComparedFaces]
GO

CREATE PROCEDURE [dbo].[ComparedFaces]
	@WinnerID	varchar(50),
	@LoserID	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	UPDATE [dbo].[Faces]
		SET [Level] = [Level] + (CASE WHEN MediaID = @WinnerID THEN 1 ELSE -1 END)
	WHERE MediaID = @WinnerID OR MediaID = @LoserID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SaveJudgement]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SaveJudgement]
GO

CREATE PROCEDURE [dbo].[SaveJudgement]
	@MediaID	varchar(50),
	@UserID		varchar(50),
	@Score		int,
	@Friendship	bit,
	@Marriage	bit
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF EXISTS (
		SELECT TOP(1) *
		FROM [dbo].[Judgements]
		WHERE MediaID = @MediaID AND UserID = @UserID
	) BEGIN
		UPDATE [dbo].[Judgements]
			SET Score = ISNULL(@Score, 0),
				Friendship = ISNULL(@Friendship, 0),
				Marriage = ISNULL(@Marriage, 0)
		WHERE MediaID = @MediaID AND UserID = @UserID
	END
	ELSE BEGIN
		INSERT INTO [dbo].[Judgements] (MediaID, UserID, Score, Friendship, Marriage)
		VALUES (@MediaID, @UserID, @Score, ISNULL(@Friendship, 0), ISNULL(@Marriage, 0))
	END
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[ReportFace]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[ReportFace]
GO

CREATE PROCEDURE [dbo].[ReportFace]
	@MediaID	varchar(50),
	@UserID		varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF NOT EXISTS (
		SELECT TOP(1) *
		FROM [dbo].[Reported]
		WHERE MediaID = @MediaID AND UserID = @UserID
	) BEGIN
		INSERT INTO [dbo].[Reported] (MediaID, UserID)
		VALUES (@MediaID, @UserID)
	END
	
	SELECT 1
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[UndoReportedFace]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[UndoReportedFace]
GO

CREATE PROCEDURE [dbo].[UndoReportedFace]
	@MediaID	varchar(50),
	@UserID		varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DELETE [dbo].[Reported]
	WHERE MediaID = @MediaID AND UserID = @UserID
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SaveIPGLog]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SaveIPGLog]
GO

CREATE PROCEDURE [dbo].[SaveIPGLog]
	@Logs	IPGLogTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[IPGLogs] (
		[Action],
		UserID,
		DeviceID,
		DeviceModel,
		TargetUserID,
		[Time]
	)
	SELECT	L.[Action], 
			L.UserID, 
			L.DeviceID, 
			CASE WHEN L.DeviceModel IS NULL THEN NULL ELSE SUBSTRING(L.DeviceModel, 0, 40) END, 
			L.TargetUserID, 
			L.[Time]
	FROM @Logs AS L
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[AppPurchaseLog]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[AppPurchaseLog]
GO

CREATE PROCEDURE [dbo].[AppPurchaseLog]
	@UserID				varchar(50),
	@AppName			varchar(50),
	@PurchaseID			varchar(30),
	@Amount				int,
	@PaymentProvider	varchar(30),
	@AgentID			varchar(50),
	@Time				datetime
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	IF EXISTS (
		SELECT TOP(1) ID
		FROM [dbo].[AppPurchase]
		WHERE PaymentProvider = @PaymentProvider AND PurchaseID = @PurchaseID
	) BEGIN
		UPDATE [dbo].[AppPurchase]
			SET UserID = ISNULL(UserID, @UserID)
		WHERE PaymentProvider = @PaymentProvider AND PurchaseID = @PurchaseID
	
		SELECT 1
		RETURN
	END
	
	INSERT INTO [dbo].[AppPurchase] (
		UserID,
		AppName,
		PurchaseID,
		Amount,
		PaymentProvider,
		AgentID,
		[Time]
	)
	VALUES (
		@UserID,
		@AppName,
		@PurchaseID,
		@Amount,
		@PaymentProvider,
		@AgentID,
		@Time
	)
	
	SELECT @@ROWCOUNT
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[HasPurchased]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[HasPurchased]
GO

CREATE PROCEDURE [dbo].[HasPurchased]
	@UserID		varchar(50),
	@AppName	varchar(50)
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	SELECT TOP(1) 1
	FROM [dbo].[AppPurchase]
	WHERE UserID = @UserID AND LOWER(AppName) = LOWER(@AppName)
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SuggestFollowRequests]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SuggestFollowRequests]
GO

CREATE PROCEDURE [dbo].[SuggestFollowRequests]
	@UserIDs	BigintTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	DECLARE @UsersCount int = (SELECT COUNT(*) FROM @UserIDs)
	
	SELECT B.ID AS UserID, A.UserID AS TargetUserID
	FROM (
			SELECT	(X.RowNum % @UsersCount) + 1 AS RowNum,
					CEILING(CAST(X.RowNum AS float) / CAST(@UsersCount AS float)) AS Ind,
					 X.UserID
			FROM (
					SELECT	ROW_NUMBER() OVER(ORDER BY NEWID() ASC) AS RowNum,
							CAST(U.UserID AS bigint) AS UserID
					FROM [dbo].[Users] AS U TABLESAMPLE(1000 ROWS)
				) AS X
		) AS A
		INNER JOIN (
			SELECT ROW_NUMBER() OVER (ORDER BY NEWID() ASC) AS RowNum, IDs.Value AS ID
			FROM @UserIDs AS IDs
		) AS B
		ON B.RowNum = A.RowNum
		LEFT JOIN [dbo].[FollowRequests] AS R
		ON R.UserID = B.ID AND R.TargetUserID = A.UserID
	WHERE A.Ind <= 100 AND R.UserID IS NULL
END

GO


IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[SaveFollowRequests]') and 
	OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[SaveFollowRequests]
GO

CREATE PROCEDURE [dbo].[SaveFollowRequests]
	@Requests	BigintPairTableType readonly
WITH ENCRYPTION
AS
BEGIN
	SET NOCOUNT ON
	
	INSERT INTO [dbo].[FollowRequests] (UserID, TargetUserID)
	SELECT X.FirstValue, X.SecondValue
	FROM @Requests AS X
		LEFT JOIN [dbo].[FollowRequests] AS R
		ON R.UserID = X.FirstValue AND R.TargetUserID = X.SecondValue
	WHERE R.UserID IS NULL
	
	SELECT @@ROWCOUNT
END

GO