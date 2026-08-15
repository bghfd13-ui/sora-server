using Roblox.Rendering;
using Roblox.Website.Middleware;
using Roblox.Libraries.RemoteView;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Net.Http.Headers;
using Roblox;
using Roblox.Services;
using Roblox.Services.App.FeatureFlags;
using Roblox.Website.Hubs;
using System.Reflection;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc.Formatters;

var domain = AppDomain.CurrentDomain;
domain.SetData("REGEX_DEFAULT_MATCH_TIMEOUT", TimeSpan.FromSeconds(5));

IConfiguration configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddEnvironmentVariables()
    .Build();

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// ENVIRONMENT HELPERS
// Render environment variables have priority over appsettings.
// Supports both POSTGRES/Postgres and REDIS/Redis.
// ============================================================

string GetConfig(string environmentName, string configPath)
{
    var value = Environment.GetEnvironmentVariable(environmentName);

    if (!string.IsNullOrWhiteSpace(value))
        return value;

    value = Environment.GetEnvironmentVariable(
        environmentName.ToUpperInvariant()
    );

    if (!string.IsNullOrWhiteSpace(value))
        return value;

    value = configuration[configPath];

    if (!string.IsNullOrWhiteSpace(value))
        return value;

    throw new InvalidOperationException(
        "Missing configuration: " + environmentName
    );
}

// ============================================================
// DATABASE
// ============================================================

var postgresConnection = GetConfig("POSTGRES", "Postgres");
Roblox.Services.Database.Configure(postgresConnection);

// ============================================================
// REDIS
// ============================================================

var redisConnection = GetConfig("REDIS", "Redis");
Roblox.Services.Cache.Configure(redisConnection);

// ============================================================
// GENERAL CONFIG
// ============================================================

Roblox.Configuration.CdnBaseUrl =
    configuration["CdnBaseUrl"] ?? "";

Roblox.Configuration.AssetDirectory =
    configuration["Directories:Asset"]!;

Roblox.Configuration.StorageDirectory =
    configuration["Directories:Storage"]!;

Roblox.Configuration.ThumbnailsDirectory =
    configuration["Directories:Thumbnails"]!;

Roblox.Configuration.GroupIconsDirectory =
    configuration["Directories:GroupIcons"]!;

Roblox.Configuration.PublicDirectory =
    configuration["Directories:Public"]!;

Roblox.Configuration.XmlTemplatesDirectory =
    configuration["Directories:XmlTemplates"]!;

Roblox.Configuration.JsonDataDirectory =
    configuration["Directories:JsonData"]!;

Roblox.Configuration.ScriptDirectory =
    configuration["Directories:ScriptsData"]!;

Roblox.Configuration.AdminBundleDirectory =
    configuration["Directories:AdminBundle"]!;

Roblox.Configuration.EconomyChatBundleDirectory =
    configuration["Directories:EconomyChatBundle"]!;

Roblox.Configuration.BaseUrl =
    GetConfig("BASE_URL", "BaseUrl");

// ============================================================
// FRONTEND
// ============================================================

var frontendUrl =
    GetConfig("FRONTEND_URL", "FrontendUrl");

RemoteView.Configure(
    frontendUrl,
    configuration["Authorization"]!
);

Roblox.Configuration.ShortBaseUrl =
    Roblox.Configuration.BaseUrl!.Replace("https://www.", "");

// ============================================================
// HCAPTCHA
// ============================================================

Roblox.Configuration.HCaptchaPublicKey =
    configuration["HCaptcha:Public"]!;

Roblox.Configuration.HCaptchaPrivateKey =
    configuration["HCaptcha:Private"]!;

// ============================================================
// DISCORD
// ============================================================

Roblox.Configuration.DiscordClientId =
    configuration["Discord:ClientId"]!;

Roblox.Configuration.DiscordClientSecret =
    configuration["Discord:ClientSecret"]!;

Roblox.Configuration.DiscordGuildId =
    configuration["Discord:GuildId"]!;

Roblox.Configuration.DiscordBotToken =
    configuration["Discord:BotToken"]!;

Roblox.Configuration.DiscordLogChannelId =
    configuration["Discord:LogChannelId"]!;

Roblox.Configuration.DiscordApplicationCallback =
    Roblox.Configuration.BaseUrl +
    configuration["Discord:ApplicationCallback"];

Roblox.Configuration.DiscordLoginCallback =
    Roblox.Configuration.BaseUrl +
    configuration["Discord:LoginCallback"];

Roblox.Configuration.DiscordLinkCallback =
    Roblox.Configuration.BaseUrl +
    configuration["Discord:LinkCallback"];

// ============================================================
// AUTHORIZATION
// ============================================================

Roblox.Configuration.GameServerAuthorization =
    configuration["GameServerAuthorization"]!;

Roblox.Configuration.BotAuthorization =
    configuration["BotAuthorization"]!;

Roblox.Configuration.RccAuthorization =
    configuration["RccAuthorization"]!;

Roblox.Configuration.ArbiterAuthorization =
    configuration["ArbiterAuthorization"]!;

Roblox.Configuration.GameServerIp =
    configuration["GameServerIp"]!;

Roblox.Configuration.UserAgentBypassSecret =
    configuration["UserAgentBypassSecret"]!;

Roblox.Configuration.VerificationSecret =
    configuration["VerificationSecret"]!;

Roblox.Configuration.LuaScriptsDirectory =
    configuration["Directories:RCCLuaScripts"]!;

// ============================================================
// GAME SERVERS
// ============================================================

IConfiguration gameServerConfig =
    new ConfigurationBuilder()
        .AddJsonFile("game-servers.json")
        .Build();

Roblox.Configuration.GameServerIpAddresses =
    gameServerConfig
        .GetSection("GameServers")
        .Get<IEnumerable<GameServerConfigEntry>>()!;

Roblox.Configuration.AssetValidationServiceUrl =
    configuration["AssetValidation:BaseUrl"]!;

Roblox.Configuration.AssetValidationServiceAuthorization =
    configuration["AssetValidation:Authorization"]!;

GameServerService.Configure(
    string.Join(
        Guid.NewGuid().ToString(),
        new int[16].Select(_ => Guid.NewGuid().ToString())
    )
);

// ============================================================
// ASSETS
// ============================================================

Roblox.Configuration.PackageShirtAssetId =
    long.Parse(configuration["PackageShirtAssetId"]!);

Roblox.Configuration.PackagePantsAssetId =
    long.Parse(configuration["PackagePantsAssetId"]!);

Roblox.Libraries.TwitterApi.TwitterApi.Configure(
    configuration["Twitter:Bearer"]!
);

// ============================================================
// SIGNUP ASSETS
// ============================================================

var assetIdsStart =
    configuration
        .GetSection("SignupAssetIds")
        .GetChildren()
        .Select(assetIdStr => long.Parse(assetIdStr.Value!));

Roblox.Configuration.SignupAssetIds = assetIdsStart;

Roblox.Configuration.SignupAvatarAssetIds =
    configuration
        .GetSection("SignupAvatarAssetIds")
        .GetChildren()
        .Select(c => long.Parse(c.Value!));

#if DEBUG
Roblox.Configuration.RobloxAppPrefix = "rbxeconsimdev:";
#endif

// ============================================================
// FEATURES / OWNER
// ============================================================

FeatureFlags.StartUpdateFlagTask();

var ownerUserIdConfig =
    configuration.GetSection("OwnerUserId");

List<long> ownerUserIds =
    ownerUserIdConfig.Get<List<long>>()!;

Roblox.Website.Filters.StaffFilter.Configure(
    ownerUserIds
);

// ============================================================
// ASP.NET SERVICES
// ============================================================

builder.Services.AddRazorPages();

builder.Services.AddRequestDecompression();

builder.Services.AddControllers(options =>
{
    options.InputFormatters.Add(
        new XmlSerializerInputFormatter(options)
    );

    options.RespectBrowserAcceptHeader = true;
})
.AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter()
    );

    o.JsonSerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddSignalR();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.ResolveConflictingActions(
        apiDescriptions => apiDescriptions.First()
    );

    c.IgnoreObsoleteActions();
    c.IgnoreObsoleteProperties();

    c.CustomSchemaIds(
        type => type.FullName
    );

    c.EnableAnnotations();

    c.SwaggerDoc(
        "UserV1",
        new OpenApiInfo
        {
            Version = "v1",
            Title = "Users Api v1"
        }
    );

    c.SchemaGeneratorOptions.SchemaIdSelector =
        type => type.ToString();

    c.OperationFilter<SwaggerFileOperationFilter>();

    var xmlFilename =
        $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";

    var xmlPath =
        Path.Combine(
            AppContext.BaseDirectory,
            xmlFilename
        );

    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddMvc(c =>
    c.Conventions.Add(
        new ApiExplorerGetsOnlyConvention()
    )
);

// ============================================================
// BUILD
// ============================================================

var app = builder.Build();

app.UseRouting();

app.UseSwaggerUI(c =>
{
    c.ShowCommonExtensions();

    c.SwaggerEndpoint(
        "/swagger/UserV1/swagger.json",
        "UserV1"
    );
});

// ============================================================
// STATIC FILE CACHE
// ============================================================

var prepareResponseForCache =
    (StaticFileResponseContext ctx) =>
    {
        const int durationInSeconds = 86400 * 365;

        ctx.Context.Response.Headers[
            HeaderNames.CacheControl
        ] =
            "public,max-age=" + durationInSeconds;

        ctx.Context.Response.Headers.Remove(
            HeaderNames.LastModified
        );
    };

// ============================================================
// STATIC FILES
// ============================================================

var publicDirectory =
    Roblox.Configuration.PublicDirectory!;

var cssDirectory =
    Path.Combine(publicDirectory, "css", "Roblox");

var jsDirectory =
    Path.Combine(publicDirectory, "js");

var unsecuredDirectory =
    Path.Combine(publicDirectory, "UnsecuredContent");

var imgDirectory =
    Path.Combine(publicDirectory, "img");

// Make sure required directories exist.
// This prevents PhysicalFileProvider from crashing
// the application when a directory is missing.

Directory.CreateDirectory(publicDirectory);
Directory.CreateDirectory(cssDirectory);
Directory.CreateDirectory(jsDirectory);
Directory.CreateDirectory(unsecuredDirectory);
Directory.CreateDirectory(imgDirectory);

Directory.CreateDirectory(
    Roblox.Configuration.ThumbnailsDirectory!
);

Directory.CreateDirectory(
    Roblox.Configuration.GroupIconsDirectory!
);

// ============================================================
// CSS
// ============================================================

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider =
        new PhysicalFileProvider(cssDirectory),

    RequestPath = "/css",

    OnPrepareResponse =
        prepareResponseForCache
});

// ============================================================
// JS
// ============================================================

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider =
        new PhysicalFileProvider(jsDirectory),

    RequestPath = "/js",

    OnPrepareResponse =
        prepareResponseForCache
});

// ============================================================
// UNSECURED CONTENT
// ============================================================

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider =
        new PhysicalFileProvider(unsecuredDirectory),

    RequestPath = "/UnsecuredContent",

    OnPrepareResponse =
        prepareResponseForCache
});

// ============================================================
// LOCAL THUMBNAILS / GROUP ICONS
// ============================================================

if (string.IsNullOrWhiteSpace(
    Roblox.Configuration.CdnBaseUrl
))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                Roblox.Configuration.ThumbnailsDirectory!
            ),

        RequestPath =
            "/images/thumbnails",

        OnPrepareResponse =
            prepareResponseForCache
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                Roblox.Configuration.GroupIconsDirectory!
            ),

        RequestPath =
            "/images/groups",

        OnPrepareResponse =
            prepareResponseForCache
    });
}

// ============================================================
// IMAGES
// ============================================================

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider =
        new PhysicalFileProvider(imgDirectory),

    RequestPath = "/img",

    OnPrepareResponse =
        prepareResponseForCache
});

// ============================================================
// MIDDLEWARE
// ============================================================

app.UseRobloxSessionMiddleware();

app.UseMiddleware<ThumbnailMiddleware>(
    Roblox.Configuration.ThumbnailsDirectory
);

app.UseMiddleware<RobloxLoggingMiddleware>();

app.UseRobloxPlayerCorsMiddleware();

app.UseRobloxCsrfMiddleware();

app.UseApplicationGuardMiddleware();

Roblox.Website.Middleware.ApplicationGuardMiddleware.Configure(
    configuration["Authorization"]!
);

Roblox.Website.Middleware.CsrfMiddleware.Configure(
    Guid.NewGuid().ToString() +
    Guid.NewGuid().ToString() +
    Guid.NewGuid().ToString()
);

app.UseSwagger();

app.UseSwaggerUI();

app.UseMiddleware<FrontendProxyMiddleware>();

app.UseExceptionHandler("/error");

// ============================================================
// RENDERING
// ============================================================

// Render service is intentionally left on the existing
// application configuration for now.
// It will be fixed separately after the website itself
// is stable on Render.

RenderingHandler.Configure();

// ============================================================
// SESSION
// ============================================================

SessionMiddleware.Configure(
    configuration["Jwt:Sessions"]!
);

app.UseTimerMiddleware();

// ============================================================
// SIGNER
// ============================================================

Roblox.Services.Signer.SignService.Setup();

// ============================================================
// BACKGROUND TASKS
// ============================================================

_ = Task.Run(async () =>
{
    using var assets =
        Roblox.Services.ServiceProvider
            .GetOrCreate<AssetsService>();

    await assets.FixAssetImagesWithoutMetadata();
});

_ = Task.Run(
    AvatarService.StartTimerClear3D
);

// ============================================================
// ENDPOINTS
// ============================================================

app.MapControllers();

app.MapRazorPages();

app.UseWebSockets();

app.UseRequestDecompression();

app.MapHub<MessageRouterHub>(
    "/v1/router/signalr"
);

// ============================================================
// START
// ============================================================

app.Run();