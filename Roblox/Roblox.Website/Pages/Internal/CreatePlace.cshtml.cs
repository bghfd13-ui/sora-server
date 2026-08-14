using Microsoft.AspNetCore.Mvc.RazorPages;
using Roblox.Models.Assets;

namespace Roblox.Website.Pages.Internal;

public class CreatePlace : RobloxPageModel
{
    public string? errorMessage { get; set; }
    public string? successUrl { get; set; }

    public void OnGet()
    {
    }

    public async Task OnPost()
    {
        if (userSession == null)
        {
            errorMessage = "Not logged in.";
            return;
        }

        await using var createGameLock =
            await Roblox.Services.Cache.redLock.CreateLockAsync(
                "CreatePlaceSelfServiceV2:UserId:" + userSession.userId,
                TimeSpan.FromSeconds(10));

        if (!createGameLock.IsAcquired)
        {
            errorMessage = "Too many attempts. Try again in a few seconds.";
            return;
        }

        try
        {
            var asset = await services.assets.CreatePlace(
                userSession.userId,
                CreatorType.User,
                userSession.userId);

            await services.games.CreateUniverse(asset.placeId);

            successUrl = "/internal/place-update?id=" + asset.placeId;
        }
        catch (Exception ex)
        {
            errorMessage = "Could not create the game: " + ex.Message;
        }
    }
}
