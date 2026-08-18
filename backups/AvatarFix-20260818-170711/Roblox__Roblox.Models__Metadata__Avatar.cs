using System.Text.Json;

namespace Roblox.Models.Avatar;

public class ColorMetadataEntry
{
    public int brickColorId { get; set; }
    public string hexColor { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
}

public static class AvatarMetadata
{
    private static List<ColorMetadataEntry>? colors { get; set; }

    public static List<ColorMetadataEntry> GetColors()
    {
        if (colors == null)
        {
            var configuredPath = Path.Combine(Roblox.Configuration.JsonDataDirectory, "avatar-colors.json");
            var bundledPath = Path.Combine(AppContext.BaseDirectory, "avatar-colors.json");
            var path = File.Exists(configuredPath) ? configuredPath : bundledPath;
            if (!File.Exists(path))
                throw new FileNotFoundException("avatar-colors.json was not found", path);

            var fi = File.ReadAllText(path);
            colors = JsonSerializer.Deserialize<List<ColorMetadataEntry>>(fi);
        }

        if (colors == null)
            throw new Exception("Could not deserialize avatar colors configuration");

        return colors;
    }
}