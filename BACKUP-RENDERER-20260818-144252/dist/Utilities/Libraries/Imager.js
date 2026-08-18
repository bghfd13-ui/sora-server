import sharp from "sharp";
import { Console } from "./CS.js";
export class Imager {
    content;
    height = 0;
    width = 0;
    aspectRatio = 0;
    imageFormat = ImagerFormat.Undefined;
    sharp = null;
    metadata = null;
    constructor(content) {
        this.content = content;
    }
    GetImage() {
        return this.sharp;
    }
    GetMetadata() {
        return this.metadata;
    }
    async InitializeAsync() {
        try {
            this.sharp = sharp(this.content);
            this.metadata = await this.sharp.metadata();
        }
        catch (e) {
            Console.Error("Invalid image provided");
            return Promise.resolve();
        }
        if (!this.metadata || !this.metadata.format) {
            Console.Error("Invalid image provided");
            return Promise.resolve();
        }
        this.height = this.metadata.height || 0;
        this.width = this.metadata.width || 0;
        this.aspectRatio = this.width !== 0 && this.height !== 0 ? this.width / this.height : 0;
        switch (this.metadata.format.toLowerCase()) {
            case "png":
                this.imageFormat = ImagerFormat.PNG;
                break;
            case "jpeg":
            case "jpg":
                this.imageFormat = ImagerFormat.JPEG;
                break;
            case "gif":
                this.imageFormat = ImagerFormat.GIF;
                break;
            case "bmp":
                this.imageFormat = ImagerFormat.BMP;
                break;
            default:
                Console.Error("Invalid image provided");
                return Promise.resolve();
        }
    }
    static async ReadAsync(content) {
        const img = new Imager(content);
        await img.InitializeAsync();
        return img;
    }
}
export var ImagerFormat;
(function (ImagerFormat) {
    ImagerFormat[ImagerFormat["Undefined"] = 0] = "Undefined";
    ImagerFormat[ImagerFormat["PNG"] = 1] = "PNG";
    ImagerFormat[ImagerFormat["JPEG"] = 2] = "JPEG";
    ImagerFormat[ImagerFormat["GIF"] = 3] = "GIF";
    ImagerFormat[ImagerFormat["BMP"] = 4] = "BMP";
})(ImagerFormat || (ImagerFormat = {}));
