USE [insta]
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[Users](
	[UserID] [varchar](50) NOT NULL,
	[UserName] [nvarchar](100) NOT NULL,
	[FullName] [nvarchar](200) NULL,
	[Biography] [nvarchar](400) NULL,
	[Website] [nvarchar](200) NULL,
	[Media] [int] NOT NULL,
	[Follows] [int] NOT NULL,
	[Followers] [int] NOT NULL,
	[Private] [bit] NOT NULL,
	[Code] [varchar](100) NULL,
	[Token] [varchar](100) NULL,
	[LocalToken] [varchar](100) NULL,
	[Activated] [bit] NOT NULL,
	[InvitedByUserID] [varchar](50) NULL,
	[ImageURL] [varchar](300) NULL,
	[LockUntil] [datetime] NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[Gender] [varchar](10) NULL,
	[Birthday] [int] NULL,
	[Height] [int] NULL,
	[Weight] [int] NULL,
	[SkinColor] [varchar](50) NULL,
	[Job] [nvarchar](200) NULL,
	[AnnualSalary] [int] NULL
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO