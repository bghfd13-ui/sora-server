using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Roblox.Exceptions;
using Roblox.Models.Users;
using Roblox.Services.App.FeatureFlags;
using Roblox.Services.Exceptions;
using Roblox.Website.WebsiteModels;
using Roblox.Website.WebsiteModels.Authentication;
using BadRequestException = Roblox.Exceptions.BadRequestException;

namespace Roblox.Website.Controllers;

[ApiController]
[Route("/apisite/auth/v2")]
public class AuthenticationControllerV2 : ControllerBase
{
    [HttpGet("metadata")]
    public dynamic GetMetadata()
    {
        return new
        {
            cookieLawNoticeTimeout = 20 * 1000,
        };
    }

    [HttpGet("passwords/current-status")]
    public dynamic GetPasswordStatus()
    {
        return new
        {
            valid = true,
        };
    }

    private async Task CreateSessionAndSetCookie(long userId)
    {
        var sessionId = await services.users.CreateSession(userId);

        var sessionCookie =
            Roblox.Website.Middleware.SessionMiddleware.CreateJwt(
                new Roblox.Website.Middleware.JwtEntry
                {
                    sessionId = sessionId,
                    createdAt = DateTimeOffset.Now.ToUnixTimeSeconds(),
                });

        Response.Cookies.Append(
            Roblox.Website.Middleware.SessionMiddleware.CookieName,
            sessionCookie,
            new CookieOptions
            {
                // Р Р°Р±РѕС‚Р°РµС‚ РЅР° Р»РѕРєР°Р»СЊРЅРѕРј HTTP,
                // Р° РїРѕСЃР»Рµ РїРµСЂРµС…РѕРґР° Sora РЅР° HTTPS Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЃС‚Р°РЅРµС‚ Secure.
                Secure = Request.IsHttps,
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTimeOffset.Now.AddDays(364),
            });
    }

    // =========================
    // SORA LOGIN
    // =========================

    [HttpPost("login")]
    public async Task Login(
        [Required, FromBody] LoginRequest request)
    {
        FeatureFlags.FeatureCheck(FeatureFlag.LoginEnabled);

        if (request == null)
            throw new BadRequestException(0, "Invalid request");

        if (!string.IsNullOrWhiteSpace(request.ctype) &&
            !request.ctype.Equals(
                "username",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException(
                0,
                "Login type is not supported.");
        }

        var username =
            !string.IsNullOrWhiteSpace(request.cvalue)
                ? request.cvalue
                : request.username;

        if (string.IsNullOrWhiteSpace(username))
            throw new BadRequestException(
                0,
                "Username is required");

        if (string.IsNullOrWhiteSpace(request.password))
            throw new BadRequestException(
                0,
                "Password is required");

        // РќРµР±РѕР»СЊС€Р°СЏ Р·Р°С‰РёС‚Р° РѕС‚ СЃРїР°РјР° Р»РѕРіРёРЅРѕРј.
        if (!await services.cooldown.TryCooldownCheck(
                "sora:login:" + GetIP(),
                TimeSpan.FromSeconds(1)))
        {
            throw new RobloxException(
                429,
                0,
                "Too many login attempts. Try again.");
        }

        long userId;

        try
        {
            userId =
                await services.users
                    .GetUserIdFromUsername(username);
        }
        catch (RecordNotFoundException)
        {
            throw new ForbiddenException(
                1,
                "Incorrect username or password. Please try again");
        }

        bool passwordOk;

        try
        {
            passwordOk =
                await services.users
                    .VerifyPassword(userId, request.password);
        }
        catch (RecordNotFoundException)
        {
            passwordOk = false;
        }

        if (!passwordOk)
        {
            throw new ForbiddenException(
                1,
                "Incorrect username or password. Please try again");
        }

        await CreateSessionAndSetCookie(userId);
    }

    // =========================
    // SORA SIGN UP
    // =========================

    [HttpPost("signup")]
    public async Task<SignupResponse> Signup(
        [Required, FromBody] SignUpRequest request)
    {
        FeatureFlags.FeatureCheck(FeatureFlag.SignupEnabled);

        if (request == null)
            throw new BadRequestException(0, "Invalid request");

        if (string.IsNullOrWhiteSpace(request.username))
            throw new BadRequestException(
                5,
                "Username is required");

        if (string.IsNullOrWhiteSpace(request.password))
            throw new BadRequestException(
                9,
                "Password is required");

        if (!await services.cooldown.TryCooldownCheck(
                "sora:signup:" + GetIP(),
                TimeSpan.FromSeconds(5)))
        {
            throw new RobloxException(
                429,
                0,
                "Too many signup attempts. Try again shortly.");
        }

        var usernameValid =
            await services.users
                .IsUsernameValid(request.username);

        if (!usernameValid)
        {
            throw new BadRequestException(
                5,
                "Username must be 3-20 characters and contain valid characters.");
        }

        var available =
            await services.users
                .IsNameAvailableForSignup(request.username);

        if (!available)
        {
            throw new ForbiddenException(
                6,
                "Username is already taken");
        }

        if (!services.users.IsPasswordValid(request.password))
        {
            throw new ForbiddenException(
                9,
                "Password is too simple");
        }

        var gender = Gender.Unknown;

        if (!string.IsNullOrWhiteSpace(request.gender))
        {
            Enum.TryParse(
                request.gender,
                true,
                out gender);
        }

        var createdUser =
            await services.users.CreateUser(
                request.username,
                request.password,
                gender);

        await CreateSessionAndSetCookie(
            createdUser.userId);

        return new SignupResponse
        {
            userId = createdUser.userId,
            starterPlaceId = 0,
        };
    }

    // =========================
    // PASSWORD
    // =========================

    [HttpPost("user/passwords/change")]
    public async Task ChangePassword(
        [Required, FromBody] ChangePasswordRequest request)
    {
        FeatureFlags.FeatureCheck(
            FeatureFlag.ChangePasswordEnabled);

        if (!services.users.IsPasswordValid(request.newPassword))
        {
            throw new BadRequestException(
                0,
                "Invalid password");
        }

        if (!await services.cooldown.TryCooldownCheck(
                "change password " + safeUserSession.userId,
                TimeSpan.FromMinutes(1)))
        {
            throw new RobloxException(
                429,
                0,
                "TooManyRequests");
        }

        var correctPassword =
            await services.users.VerifyPassword(
                safeUserSession.userId,
                request.currentPassword);

        if (!correctPassword)
        {
            throw new BadRequestException(
                8,
                "Password does not match");
        }

        await services.users.UpdatePassword(
            safeUserSession.userId,
            request.newPassword);
    }

    // =========================
    // LOGOUT
    // =========================

    [HttpPost("logout")]
    public async Task Logout()
    {
        await services.users.DeleteSession(
            safeUserSession.sessionId);

        using var cache =
            Roblox.Services.ServiceProvider
                .GetOrCreate<Roblox.Services.UserSessionsCache>();

        cache.Remove(safeUserSession.sessionId);

        Response.Cookies.Delete(
            Roblox.Website.Middleware.SessionMiddleware.CookieName);
    }

    [HttpPost("logoutfromallsessionsandreauthenticate")]
    public async Task LogoutFromAllSessionsAndReAuthenticate()
    {
        await services.users.ExpireAllSessions(
            safeUserSession.userId);

        using var cache =
            Roblox.Services.ServiceProvider
                .GetOrCreate<Roblox.Services.UserSessionsCache>();

        cache.Remove(safeUserSession.sessionId);
    }
}