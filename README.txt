RELIVE AVATAR COMPLETE FIX

Run FIX-RELIVE-AVATAR.ps1 from this folder.
It backs up the four changed source files, ensures user_avatar.thumbnail_3d_url exists in the Sora database, verifies avatar-colors.json, and then you restart Sora.

Important: the source patch fixes empty thumbnail list crashes and makes avatar-colors.json load from the bundled output. The starter Bacon asset IDs are already present in Roblox.Services.Users.Users.cs. The installer also reports whether those three asset IDs exist in the local asset table.

Build was not run in this environment because the dotnet CLI is not installed here.
