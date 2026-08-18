var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsInt, IsOptional, Max, IsDefined, IsBoolean, IsString } from "class-validator";
export class PlayerRenderRequest {
    userId;
    jobExpiration = 20;
}
__decorate([
    IsDefined(),
    IsInt(),
    __metadata("design:type", Number)
], PlayerRenderRequest.prototype, "userId", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Object)
], PlayerRenderRequest.prototype, "jobExpiration", void 0);
export class AnimationRenderRequest {
    characterAppearanceUrl;
    animationUrl;
    jobExpiration = 20;
}
__decorate([
    IsDefined(),
    IsString(),
    __metadata("design:type", String)
], AnimationRenderRequest.prototype, "characterAppearanceUrl", void 0);
__decorate([
    IsDefined(),
    IsString(),
    __metadata("design:type", String)
], AnimationRenderRequest.prototype, "animationUrl", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Number)
], AnimationRenderRequest.prototype, "jobExpiration", void 0);
export class AssetRenderRequest {
    assetId;
    jobExpiration = 20;
    isFace = false;
}
__decorate([
    IsDefined(),
    IsInt(),
    __metadata("design:type", Number)
], AssetRenderRequest.prototype, "assetId", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Number)
], AssetRenderRequest.prototype, "jobExpiration", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], AssetRenderRequest.prototype, "isFace", void 0);
export class BodyPartRenderRequest {
    assetUrl;
    jobExpiration = 20;
}
__decorate([
    IsDefined(),
    IsString(),
    __metadata("design:type", String)
], BodyPartRenderRequest.prototype, "assetUrl", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Number)
], BodyPartRenderRequest.prototype, "jobExpiration", void 0);
export class PackageRenderRequest {
    assetUrls;
    jobExpiration = 20;
}
__decorate([
    IsDefined(),
    IsString(),
    __metadata("design:type", Number)
], PackageRenderRequest.prototype, "assetUrls", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Number)
], PackageRenderRequest.prototype, "jobExpiration", void 0);
export class PlaceRenderRequest {
    placeId;
    x;
    y;
    jobExpiration = 20;
}
__decorate([
    IsDefined(),
    IsInt(),
    __metadata("design:type", Number)
], PlaceRenderRequest.prototype, "placeId", void 0);
__decorate([
    IsDefined(),
    IsInt(),
    __metadata("design:type", Number)
], PlaceRenderRequest.prototype, "x", void 0);
__decorate([
    IsDefined(),
    IsInt(),
    __metadata("design:type", Number)
], PlaceRenderRequest.prototype, "y", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Max(60),
    __metadata("design:type", Number)
], PlaceRenderRequest.prototype, "jobExpiration", void 0);
