USE [insta]
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[Followers](
	[UserID] [varchar](50) NOT NULL,
	[FollowerUserID] [varchar](50)
 CONSTRAINT [PK_Followers] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC,
	[FollowerUserID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO