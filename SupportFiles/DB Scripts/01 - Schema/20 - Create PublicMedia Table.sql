USE [insta]
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[PublicMedia](
	[MediaID] [varchar](50) NOT NULL,
	[UserID] [varchar](50) NOT NULL,
	[Type] [varchar](20) NOT NULL,
	[CreationTime] [datetime] NOT NULL,
	[Likes] [int] NOT NULL,
	[Comments] [int] NOT NULL,
	[LocationID] [varchar](500) NULL,
	[LocationName] [nvarchar](1000) NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[Caption] [nvarchar](1000) NULL,
	[ImageURL] [varchar](300) NULL,
	[VideoURL] [varchar](300) NULL
 CONSTRAINT [PK_PublicMedia] PRIMARY KEY CLUSTERED 
(
	[MediaID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO