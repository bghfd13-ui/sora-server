FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Roblox/ ./Roblox/
COPY api/public ./api/public
COPY admin/public ./admin/public

RUN dotnet restore Roblox/Roblox.Website/Roblox.Website.csproj
RUN dotnet publish Roblox/Roblox.Website/Roblox.Website.csproj --configuration Release --output /out --no-restore

COPY Roblox/Roblox.Website/appsettings.json /out/appsettings.json
COPY Roblox/Roblox.Website/game-servers.json /out/game-servers.json

COPY Roblox/Roblox.Libraries/Templates /out/templates
COPY Roblox/Roblox.Libraries/Json /out/json

COPY api/public /out/public
COPY admin/public /out/admin

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /out ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "Roblox.Website.dll"]
