FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Source code
COPY Roblox/ ./Roblox/

# Website assets
COPY api/public ./api/public
COPY admin/public ./admin/public

# Restore
RUN dotnet restore Roblox/Roblox.Website/Roblox.Website.csproj

# Publish
RUN dotnet publish Roblox/Roblox.Website/Roblox.Website.csproj \
    --configuration Release \
    --output /out \
    --no-restore

# Configuration
COPY Roblox/Roblox.Website/appsettings.json /out/appsettings.json
COPY Roblox/Roblox.Website/game-servers.json /out/game-servers.json

# Cryptographic signing keys
COPY Roblox/Roblox.Website/Keys /out/Keys

# Libraries data
COPY Roblox/Roblox.Libraries/Templates /out/templates
COPY Roblox/Roblox.Libraries/Json /out/json

# Public website files
COPY api/public /out/public
COPY admin/public /out/admin


FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Render listens on port 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Avoid excessive FileSystemWatcher/inotify usage
ENV DOTNET_USE_POLLING_FILE_WATCHER=1

# Application
COPY --from=build /out ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "Roblox.Website.dll"]
